import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SolicitudEPP,
  EstadoSolicitudEPP,
  MotivoEPP,
} from './entities/solicitud-epp.entity';
import { CreateSolicitudEppDto } from './dto/create-solicitud-epp.dto';
import { UpdateSolicitudEppDto } from './dto/update-solicitud-epp.dto';
import { ResponseSolicitudEppDto } from './dto/response-solicitud-epp.dto';

@Injectable()
export class EppService {
  constructor(
    @InjectRepository(SolicitudEPP)
    private readonly solicitudRepository: Repository<SolicitudEPP>,
  ) {}

  async create(dto: CreateSolicitudEppDto): Promise<ResponseSolicitudEppDto> {
    // Validar descripción_motivo si motivo es "Otro"
    if (dto.motivo === MotivoEPP.Otro && !dto.descripcion_motivo) {
      throw new BadRequestException(
        'El campo descripcion_motivo es obligatorio cuando el motivo es "Otro"',
      );
    }

    const solicitud = this.solicitudRepository.create({
      tipoEpp: dto.tipo_epp,
      cantidad: dto.cantidad ?? 1,
      talla: dto.talla,
      motivo: dto.motivo,
      descripcionMotivo: dto.descripcion_motivo ?? null,
      estado: dto.estado ?? EstadoSolicitudEPP.Pendiente,
      trabajadorId: dto.trabajador_id,
      areaId: dto.area_id ?? null,
      empresaId: dto.empresa_id,
      fechaSolicitud: new Date(),
    });

    const saved = await this.solicitudRepository.save(solicitud);
    return this.findOne(saved.id);
  }

  async findAll(
    empresaId?: string,
    trabajadorId?: string,
    estado?: EstadoSolicitudEPP,
  ): Promise<ResponseSolicitudEppDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }
    if (trabajadorId) {
      where.trabajadorId = trabajadorId;
    }
    if (estado) {
      where.estado = estado;
    }

    const solicitudes = await this.solicitudRepository.find({
      where,
      relations: ['trabajador', 'supervisorAprobador', 'entregadoPor', 'area'],
      order: { createdAt: 'DESC' },
    });

    return solicitudes.map((s) => ResponseSolicitudEppDto.fromEntity(s));
  }

  async findOne(id: string): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['trabajador', 'supervisorAprobador', 'entregadoPor', 'area'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    return ResponseSolicitudEppDto.fromEntity(solicitud);
  }

  async update(
    id: string,
    dto: UpdateSolicitudEppDto,
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    // Validar descripción_motivo si motivo cambia a "Otro"
    if (
      (dto.motivo === MotivoEPP.Otro ||
        (dto.motivo === undefined && solicitud.motivo === MotivoEPP.Otro)) &&
      !dto.descripcion_motivo &&
      !solicitud.descripcionMotivo
    ) {
      throw new BadRequestException(
        'El campo descripcion_motivo es obligatorio cuando el motivo es "Otro"',
      );
    }

    // Actualizar campos básicos
    if (dto.tipo_epp !== undefined) solicitud.tipoEpp = dto.tipo_epp;
    if (dto.cantidad !== undefined) solicitud.cantidad = dto.cantidad;
    if (dto.talla !== undefined) solicitud.talla = dto.talla;
    if (dto.motivo !== undefined) solicitud.motivo = dto.motivo;
    if (dto.descripcion_motivo !== undefined)
      solicitud.descripcionMotivo = dto.descripcion_motivo;
    if (dto.area_id !== undefined) solicitud.areaId = dto.area_id;

    // Manejar aprobación
    if (dto.supervisor_aprobador_id !== undefined) {
      solicitud.supervisorAprobadorId = dto.supervisor_aprobador_id;
    }
    if (dto.fecha_aprobacion !== undefined) {
      solicitud.fechaAprobacion = new Date(dto.fecha_aprobacion);
    }
    if (dto.comentarios_aprobacion !== undefined) {
      solicitud.comentariosAprobacion = dto.comentarios_aprobacion;
    }

    // Manejar entrega
    if (dto.entregado_por_id !== undefined) {
      solicitud.entregadoPorId = dto.entregado_por_id;
    }
    if (dto.fecha_entrega !== undefined) {
      solicitud.fechaEntrega = new Date(dto.fecha_entrega);
    }
    if (dto.firma_recepcion_url !== undefined) {
      solicitud.firmaRecepcionUrl = dto.firma_recepcion_url;
    }

    // Manejar cambio de estado
    if (dto.estado !== undefined) {
      this.validateEstadoTransition(solicitud.estado, dto.estado);
      solicitud.estado = dto.estado;

      // Auto-completar fechas según el estado
      if (dto.estado === EstadoSolicitudEPP.Aprobada && !solicitud.fechaAprobacion) {
        solicitud.fechaAprobacion = new Date();
      }
      if (dto.estado === EstadoSolicitudEPP.Entregada && !solicitud.fechaEntrega) {
        solicitud.fechaEntrega = new Date();
      }
    }

    await this.solicitudRepository.save(solicitud);
    return this.findOne(id);
  }

  validateEstadoTransition(
    estadoActual: EstadoSolicitudEPP,
    estadoNuevo: EstadoSolicitudEPP,
  ): void {
    const transicionesPermitidas: Record<EstadoSolicitudEPP, EstadoSolicitudEPP[]> = {
      [EstadoSolicitudEPP.Pendiente]: [
        EstadoSolicitudEPP.Aprobada,
        EstadoSolicitudEPP.Rechazada,
      ],
      [EstadoSolicitudEPP.Aprobada]: [EstadoSolicitudEPP.Entregada],
      [EstadoSolicitudEPP.Rechazada]: [],
      [EstadoSolicitudEPP.Entregada]: [],
    };

    const permitidos = transicionesPermitidas[estadoActual];
    if (!permitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`,
      );
    }
  }

  async updateEstado(
    id: string,
    nuevoEstado: EstadoSolicitudEPP,
    usuarioId?: string,
    comentariosAprobacion?: string,
    firmaRecepcionUrl?: string,
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    // Validar transición de estado
    this.validateEstadoTransition(solicitud.estado, nuevoEstado);

    // Actualizar estado
    solicitud.estado = nuevoEstado;

    // Lógica de aprobación
    if (nuevoEstado === EstadoSolicitudEPP.Aprobada) {
      if (usuarioId) {
        solicitud.supervisorAprobadorId = usuarioId;
      }
      if (!solicitud.fechaAprobacion) {
        solicitud.fechaAprobacion = new Date();
      }
      if (comentariosAprobacion) {
        solicitud.comentariosAprobacion = comentariosAprobacion;
      }
    }

    // Lógica de entrega automática
    if (nuevoEstado === EstadoSolicitudEPP.Entregada) {
      if (usuarioId) {
        solicitud.entregadoPorId = usuarioId;
      }
      if (!solicitud.fechaEntrega) {
        solicitud.fechaEntrega = new Date();
      }
      if (firmaRecepcionUrl) {
        solicitud.firmaRecepcionUrl = firmaRecepcionUrl;
      }
    }

    await this.solicitudRepository.save(solicitud);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const solicitud = await this.solicitudRepository.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    // No permitir eliminar solicitudes entregadas
    if (solicitud.estado === EstadoSolicitudEPP.Entregada) {
      throw new BadRequestException(
        'No se puede eliminar una solicitud que ya fue entregada',
      );
    }

    await this.solicitudRepository.remove(solicitud);
  }
}
