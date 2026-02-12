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
} from './entities/solicitud-epp.entity';
import { SolicitudEPPDetalle } from './entities/solicitud-epp-detalle.entity';
import { EPP } from './entities/epp.entity';
import { CreateSolicitudEppDto } from './dto/create-solicitud-epp.dto';
import { UpdateSolicitudEppDto } from './dto/update-solicitud-epp.dto';
import { ResponseSolicitudEppDto } from './dto/response-solicitud-epp.dto';
import { CreateEppDto } from './dto/create-epp.dto';
import { UpdateEppDto } from './dto/update-epp.dto';
import { ResponseEppDto } from './dto/response-epp.dto';
import { CategoriaEPP } from './entities/epp.entity';
import { ResponseKardexDto } from './dto/response-kardex.dto';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Injectable()
export class EppService {
  constructor(
    @InjectRepository(SolicitudEPP)
    private readonly solicitudRepository: Repository<SolicitudEPP>,
    @InjectRepository(SolicitudEPPDetalle)
    private readonly detalleRepository: Repository<SolicitudEPPDetalle>,
    @InjectRepository(EPP)
    private readonly eppRepository: Repository<EPP>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  // ========== CRUD EPP (Catálogo) ==========

  async createEpp(dto: CreateEppDto): Promise<ResponseEppDto> {
    const epp = this.eppRepository.create({
      nombre: dto.nombre,
      tipoProteccion: dto.tipo_proteccion,
      categoria: dto.categoria ?? CategoriaEPP.EPP,
      descripcion: dto.descripcion ?? null,
      imagenUrl: dto.imagen_url ?? null,
      vigencia: dto.vigencia ?? null,
      adjuntoPdfUrl: dto.adjunto_pdf_url ?? null,
      stock: dto.stock ?? 0,
      empresaId: dto.empresa_id,
    });

    const saved = await this.eppRepository.save(epp);
    return ResponseEppDto.fromEntity(saved);
  }

  async findAllEpp(empresaId?: string, empresaIds?: string[]): Promise<ResponseEppDto[]> {
    const qb = this.eppRepository.createQueryBuilder('e').orderBy('e.nombre', 'ASC');
    if (empresaIds && empresaIds.length > 0) {
      qb.andWhere('e.empresaId IN (:...empresaIds)', { empresaIds });
    } else if (empresaId) {
      qb.andWhere('e.empresaId = :empresaId', { empresaId });
    }
    const epps = await qb.getMany();
    return epps.map((e) => ResponseEppDto.fromEntity(e));
  }

  async findOneEpp(id: string): Promise<ResponseEppDto> {
    const epp = await this.eppRepository.findOne({ where: { id } });

    if (!epp) {
      throw new NotFoundException(`EPP con ID ${id} no encontrado`);
    }

    return ResponseEppDto.fromEntity(epp);
  }

  async updateEpp(id: string, dto: UpdateEppDto): Promise<ResponseEppDto> {
    const epp = await this.eppRepository.findOne({ where: { id } });

    if (!epp) {
      throw new NotFoundException(`EPP con ID ${id} no encontrado`);
    }

    if (dto.nombre !== undefined) epp.nombre = dto.nombre;
    if (dto.tipo_proteccion !== undefined) epp.tipoProteccion = dto.tipo_proteccion;
    if (dto.categoria !== undefined) epp.categoria = dto.categoria;
    if (dto.descripcion !== undefined) epp.descripcion = dto.descripcion ?? null;
    if (dto.imagen_url !== undefined) epp.imagenUrl = dto.imagen_url ?? null;
    if (dto.vigencia !== undefined) epp.vigencia = dto.vigencia ?? null;
    if (dto.adjunto_pdf_url !== undefined) epp.adjuntoPdfUrl = dto.adjunto_pdf_url ?? null;
    if (dto.stock !== undefined) epp.stock = dto.stock ?? 0;

    const saved = await this.eppRepository.save(epp);
    return ResponseEppDto.fromEntity(saved);
  }

  // ========== CRUD Solicitudes ==========

  async create(dto: CreateSolicitudEppDto): Promise<ResponseSolicitudEppDto> {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('Debe incluir al menos un item de EPP');
    }

    // Generar código correlativo
    const year = new Date().getFullYear();
    const count = await this.solicitudRepository.count({
      where: { empresaId: dto.empresa_id },
    });
    const codigoCorrelativo = `EPP-${year}-${String(count + 1).padStart(4, '0')}`;

    // Crear solicitud
    const solicitud = this.solicitudRepository.create({
      codigoCorrelativo,
      fechaSolicitud: new Date(),
      usuarioEppId: dto.usuario_epp_id,
      solicitanteId: dto.solicitante_id,
      motivo: dto.motivo ?? null,
      centroCostos: dto.centro_costos ?? null,
      comentarios: dto.comentarios ?? null,
      observaciones: dto.observaciones ?? null,
      estado: dto.estado ?? EstadoSolicitudEPP.Pendiente,
      areaId: dto.area_id ?? null,
      empresaId: dto.empresa_id,
    });

    const saved = await this.solicitudRepository.save(solicitud);

    // Crear detalles
    const detalles = dto.detalles.map((detalleDto) =>
      this.detalleRepository.create({
        solicitudEppId: saved.id,
        eppId: detalleDto.epp_id,
        cantidad: detalleDto.cantidad,
      }),
    );

    await this.detalleRepository.save(detalles);

    return this.findOne(saved.id);
  }

  async findAll(
    empresaId?: string,
    usuarioEppId?: string,
    solicitanteId?: string,
    estado?: EstadoSolicitudEPP,
    areaId?: string,
    sede?: string,
  ): Promise<ResponseSolicitudEppDto[]> {
    const query = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.usuarioEpp', 'usuarioEpp')
      .leftJoinAndSelect('solicitud.solicitante', 'solicitante')
      .leftJoinAndSelect('solicitud.supervisorAprobador', 'supervisorAprobador')
      .leftJoinAndSelect('solicitud.entregadoPor', 'entregadoPor')
      .leftJoinAndSelect('solicitud.area', 'area')
      .leftJoinAndSelect('solicitud.empresa', 'empresa')
      .leftJoinAndSelect('solicitud.detalles', 'detalles')
      .leftJoinAndSelect('detalles.epp', 'epp');

    if (empresaId) {
      query.andWhere('solicitud.empresaId = :empresaId', { empresaId });
    }
    if (usuarioEppId) {
      query.andWhere('solicitud.usuarioEppId = :usuarioEppId', { usuarioEppId });
    }
    if (solicitanteId) {
      query.andWhere('solicitud.solicitanteId = :solicitanteId', { solicitanteId });
    }
    if (estado) {
      query.andWhere('solicitud.estado = :estado', { estado });
    }
    if (areaId) {
      query.andWhere('solicitud.areaId = :areaId', { areaId });
    }

    query.orderBy('solicitud.createdAt', 'DESC');

    const solicitudes = await query.getMany();

    return solicitudes.map((s) => ResponseSolicitudEppDto.fromEntity(s));
  }

  async findOne(id: string): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: [
        'usuarioEpp',
        'usuarioEpp.trabajador',
        'solicitante',
        'solicitante.area',
        'supervisorAprobador',
        'supervisorAprobador.trabajador',
        'entregadoPor',
        'entregadoPor.trabajador',
        'area',
        'empresa',
        'detalles',
        'detalles.epp',
        'detalles.exceptuadoPor',
        'detalles.exceptuadoPor.trabajador',
        'detalles.agregadoPor',
        'detalles.agregadoPor.trabajador',
      ],
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
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['detalles'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    const estadosInmutables = [
      EstadoSolicitudEPP.Aprobada,
      EstadoSolicitudEPP.Entregada,
      EstadoSolicitudEPP.Rechazada,
    ];
    if (estadosInmutables.includes(solicitud.estado)) {
      throw new BadRequestException(
        `No se puede modificar una solicitud en estado ${solicitud.estado}. Es un estado de auditoría.`,
      );
    }

    if (solicitud.estado === EstadoSolicitudEPP.Pendiente) {
      throw new BadRequestException(
        'No se puede modificar una solicitud en estado PENDIENTE. Cambie a OBSERVADA para realizar ajustes.',
      );
    }

    // Actualizar campos básicos (solo permitido en Observada)
    if (dto.motivo !== undefined) solicitud.motivo = dto.motivo;
    if (dto.centro_costos !== undefined) solicitud.centroCostos = dto.centro_costos;
    if (dto.comentarios !== undefined) solicitud.comentarios = dto.comentarios;
    if (dto.observaciones !== undefined) solicitud.observaciones = dto.observaciones;
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

  async toggleExceptuar(
    solicitudId: string,
    detalleId: string,
    usuarioId?: string,
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
      relations: ['detalles'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${solicitudId} no encontrada`);
    }

    if (solicitud.estado !== EstadoSolicitudEPP.Observada) {
      throw new BadRequestException(
        'Solo se pueden exceptuar items cuando la solicitud está en estado OBSERVADA',
      );
    }

    const detalle = solicitud.detalles?.find((d) => d.id === detalleId);
    if (!detalle) {
      throw new NotFoundException(`Detalle con ID ${detalleId} no encontrado`);
    }

    detalle.exceptuado = !detalle.exceptuado;
    detalle.exceptuadoPorId = detalle.exceptuado ? usuarioId ?? null : null;
    await this.detalleRepository.save(detalle);

    return this.findOne(solicitudId);
  }

  async agregarDetalle(
    solicitudId: string,
    eppId: string,
    cantidad: number,
    usuarioId?: string,
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
      relations: ['detalles', 'empresa'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${solicitudId} no encontrada`);
    }

    const estadosEditable = [EstadoSolicitudEPP.Observada, EstadoSolicitudEPP.Aprobada];
    if (!estadosEditable.includes(solicitud.estado)) {
      throw new BadRequestException(
        'Solo se pueden agregar items cuando la solicitud está en estado OBSERVADA o APROBADA',
      );
    }

    const epp = await this.eppRepository.findOne({ where: { id: eppId } });
    if (!epp) {
      throw new NotFoundException(`EPP con ID ${eppId} no encontrado`);
    }

    if (epp.empresaId !== solicitud.empresaId) {
      throw new BadRequestException('El EPP debe pertenecer a la misma empresa que la solicitud');
    }

    const detalle = this.detalleRepository.create({
      solicitudEppId: solicitudId,
      eppId,
      cantidad: Math.max(1, cantidad),
      agregado: true,
      agregadoPorId: usuarioId ?? null,
    });

    await this.detalleRepository.save(detalle);

    return this.findOne(solicitudId);
  }

  private readonly TRANSICIONES_VALIDAS: Record<EstadoSolicitudEPP, EstadoSolicitudEPP[]> = {
    [EstadoSolicitudEPP.Pendiente]: [EstadoSolicitudEPP.Observada, EstadoSolicitudEPP.Aprobada, EstadoSolicitudEPP.Rechazada],
    [EstadoSolicitudEPP.Observada]: [EstadoSolicitudEPP.Pendiente, EstadoSolicitudEPP.Aprobada, EstadoSolicitudEPP.Rechazada],
    [EstadoSolicitudEPP.Aprobada]: [EstadoSolicitudEPP.Entregada],
    [EstadoSolicitudEPP.Entregada]: [],
    [EstadoSolicitudEPP.Rechazada]: [],
  };

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

    const permitidos = this.TRANSICIONES_VALIDAS[solicitud.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede pasar de ${solicitud.estado} a ${nuevoEstado}. Transiciones permitidas: ${permitidos.join(', ') || 'ninguna'}`,
      );
    }

    solicitud.estado = nuevoEstado;

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

    if (nuevoEstado === EstadoSolicitudEPP.Rechazada) {
      if (usuarioId) {
        solicitud.supervisorAprobadorId = usuarioId;
      }
      if (comentariosAprobacion) {
        solicitud.comentariosAprobacion = comentariosAprobacion;
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

    if (solicitud.estado === EstadoSolicitudEPP.Entregada) {
      throw new BadRequestException(
        'No se puede eliminar una solicitud que ya fue entregada',
      );
    }

    await this.solicitudRepository.remove(solicitud);
  }

  // ========== Kardex Histórico ==========

  async getKardexPorTrabajador(
    trabajadorId: string,
  ): Promise<ResponseKardexDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: trabajadorId },
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${trabajadorId} no encontrado`);
    }

    const solicitudes = await this.solicitudRepository.find({
      where: { solicitanteId: trabajadorId },
      relations: [
        'usuarioEpp',
        'solicitante',
        'supervisorAprobador',
        'entregadoPor',
        'area',
        'empresa',
        'detalles',
        'detalles.epp',
      ],
      order: { fechaSolicitud: 'DESC' },
    });

    return ResponseKardexDto.fromEntity({
      trabajador,
      solicitudes,
    });
  }
}
