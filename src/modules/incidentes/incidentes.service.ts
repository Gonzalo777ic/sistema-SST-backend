import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Incidente,
  EstadoIncidente,
  SeveridadIncidente,
  TipoIncidente,
} from './entities/incidente.entity';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { ResponseIncidenteDto } from './dto/response-incidente.dto';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { AccionCorrectiva, EstadoAccion } from '../acciones-correctivas/entities/accion-correctiva.entity';

@Injectable()
export class IncidentesService {
  constructor(
    @InjectRepository(Incidente)
    private readonly incidenteRepository: Repository<Incidente>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(AccionCorrectiva)
    private readonly accionCorrectivaRepository: Repository<AccionCorrectiva>,
  ) {}

  async create(dto: CreateIncidenteDto): Promise<ResponseIncidenteDto> {
    let trabajadorAfectadoId = dto.trabajador_afectado_id ?? null;
    let nombreTrabajadorSnapshot = dto.trabajador_afectado ?? null;

    // Si se proporciona trabajador_afectado_id, obtener el nombre para snapshot
    if (trabajadorAfectadoId) {
      const trabajador = await this.trabajadorRepository.findOne({
        where: { id: trabajadorAfectadoId },
      });
      if (trabajador) {
        nombreTrabajadorSnapshot = trabajador.nombreCompleto;
      }
    }

    // Generar código correlativo
    const year = new Date().getFullYear();
    const count = await this.incidenteRepository.count({
      where: { empresaId: dto.empresa_id },
    });
    const codigoCorrelativo = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

    const incidente = this.incidenteRepository.create({
      tipo: dto.tipo,
      severidad: dto.severidad,
      fechaHora: new Date(dto.fecha_hora),
      descripcion: dto.descripcion,
      parteCuerpoAfectada: dto.parte_cuerpo_afectada ?? null,
      diasPerdidos: dto.dias_perdidos ?? 0,
      fotos: dto.fotos ?? null,
      causas: dto.causas ?? null,
      accionesInmediatas: dto.acciones_inmediatas ?? null,
      testigos: dto.testigos ?? null,
      accionesCorrectivas: dto.acciones_correctivas ?? null,
      estado: dto.estado ?? EstadoIncidente.Reportado,
      areaTrabajo: dto.area_trabajo,
      codigoCorrelativo,
      trabajadorAfectadoId,
      nombreTrabajadorSnapshot,
      areaId: dto.area_id ?? null,
      responsableInvestigacionId: dto.responsable_investigacion_id ?? null,
      empresaId: dto.empresa_id,
      reportadoPorId: dto.reportado_por_id,
    });

    const saved = await this.incidenteRepository.save(incidente);

    // Notificación para severidad Grave o Fatal
    if (
      saved.severidad === SeveridadIncidente.Grave ||
      saved.severidad === SeveridadIncidente.Fatal
    ) {
      // TODO: Implementar notificación a Gerencia y Área Legal
      // Por ahora solo logueamos
      console.log(
        `⚠️ ALERTA: Incidente ${saved.severidad} reportado: ${saved.id}`,
      );
    }

    return this.findOne(saved.id);
  }

  async findAll(
    empresaId?: string,
    severidad?: SeveridadIncidente,
    search?: string,
    tipo?: TipoIncidente,
    estado?: EstadoIncidente,
    fechaDesde?: string,
    fechaHasta?: string,
    unidad?: string,
    areaId?: string,
    sede?: string,
  ): Promise<ResponseIncidenteDto[]> {
    const queryBuilder = this.incidenteRepository
      .createQueryBuilder('incidente')
      .leftJoinAndSelect('incidente.trabajadorAfectado', 'trabajador')
      .leftJoinAndSelect('incidente.responsableInvestigacion', 'responsable')
      .leftJoinAndSelect('incidente.reportadoPor', 'reportado')
      .leftJoinAndSelect('incidente.area', 'area')
      .leftJoinAndSelect('incidente.empresa', 'empresa')
      .orderBy('incidente.createdAt', 'DESC');

    if (empresaId) {
      queryBuilder.andWhere('incidente.empresaId = :empresaId', { empresaId });
    }

    if (severidad) {
      queryBuilder.andWhere('incidente.severidad = :severidad', { severidad });
    }

    if (tipo) {
      queryBuilder.andWhere('incidente.tipo = :tipo', { tipo });
    }

    if (estado) {
      queryBuilder.andWhere('incidente.estado = :estado', { estado });
    }

    if (fechaDesde) {
      queryBuilder.andWhere('incidente.fechaHora >= :fechaDesde', {
        fechaDesde: new Date(fechaDesde),
      });
    }

    if (fechaHasta) {
      queryBuilder.andWhere('incidente.fechaHora <= :fechaHasta', {
        fechaHasta: new Date(fechaHasta),
      });
    }

    if (areaId) {
      queryBuilder.andWhere('incidente.areaId = :areaId', { areaId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(incidente.descripcion ILIKE :search OR incidente.areaTrabajo ILIKE :search OR incidente.codigoCorrelativo ILIKE :search OR trabajador.nombreCompleto ILIKE :search OR reportado.nombreCompleto ILIKE :search OR reportado.dni ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const incidentes = await queryBuilder.getMany();

    // Obtener conteos de medidas correctivas para cada incidente
    const incidentesConMedidas = await Promise.all(
      incidentes.map(async (incidente) => {
        const medidas = await this.accionCorrectivaRepository.find({
          where: {
            incidenteId: incidente.id,
            fuente: 'Accidentes' as any,
          },
        });

        const totalMedidas = medidas.length;
        const medidasAprobadas = medidas.filter(
          (m) => m.estado === EstadoAccion.Aprobado,
        ).length;

        return {
          ...incidente,
          totalMedidas,
          medidasAprobadas,
        };
      }),
    );

    return incidentesConMedidas.map((incidente) =>
      ResponseIncidenteDto.fromEntity(incidente),
    );
  }

  async findOne(id: string): Promise<ResponseIncidenteDto> {
    const incidente = await this.incidenteRepository.findOne({
      where: { id },
      relations: [
        'trabajadorAfectado',
        'responsableInvestigacion',
        'reportadoPor',
        'area',
        'empresa',
      ],
    });

    if (!incidente) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    // Obtener conteos de medidas correctivas
    const medidas = await this.accionCorrectivaRepository.find({
      where: {
        incidenteId: incidente.id,
        fuente: 'Accidentes' as any,
      },
    });

    const totalMedidas = medidas.length;
    const medidasAprobadas = medidas.filter(
      (m) => m.estado === EstadoAccion.Aprobado,
    ).length;

    return ResponseIncidenteDto.fromEntity({
      ...incidente,
      totalMedidas,
      medidasAprobadas,
    });
  }

  async update(
    id: string,
    dto: UpdateIncidenteDto,
  ): Promise<ResponseIncidenteDto> {
    const incidente = await this.incidenteRepository.findOne({ where: { id } });

    if (!incidente) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    // Validar inmutabilidad si está Cerrado
    if (incidente.estado === EstadoIncidente.Cerrado) {
      const camposInmutables = [
        'descripcion',
        'fecha_hora',
        'trabajador_afectado_id',
      ];
      const camposModificados = Object.keys(dto).filter((key) =>
        camposInmutables.includes(key),
      );

      if (camposModificados.length > 0) {
        throw new BadRequestException(
          `No se pueden modificar los campos ${camposModificados.join(', ')} cuando el incidente está Cerrado`,
        );
      }
    }

    // Actualizar campos permitidos
    if (dto.tipo !== undefined) incidente.tipo = dto.tipo;
    if (dto.severidad !== undefined) incidente.severidad = dto.severidad;
    if (dto.fecha_hora && incidente.estado !== EstadoIncidente.Cerrado) {
      incidente.fechaHora = new Date(dto.fecha_hora);
    }
    if (dto.descripcion && incidente.estado !== EstadoIncidente.Cerrado) {
      incidente.descripcion = dto.descripcion;
    }
    if (dto.parte_cuerpo_afectada !== undefined)
      incidente.parteCuerpoAfectada = dto.parte_cuerpo_afectada;
    if (dto.dias_perdidos !== undefined)
      incidente.diasPerdidos = dto.dias_perdidos;
    if (dto.fotos !== undefined) incidente.fotos = dto.fotos;
    if (dto.causas !== undefined) incidente.causas = dto.causas;
    if (dto.acciones_inmediatas !== undefined)
      incidente.accionesInmediatas = dto.acciones_inmediatas;
    if (dto.testigos !== undefined) incidente.testigos = dto.testigos;
    if (dto.acciones_correctivas !== undefined)
      incidente.accionesCorrectivas = dto.acciones_correctivas;
    if (dto.estado !== undefined) incidente.estado = dto.estado;
    if (dto.area_trabajo !== undefined)
      incidente.areaTrabajo = dto.area_trabajo;
    if (dto.trabajador_afectado_id !== undefined && incidente.estado !== EstadoIncidente.Cerrado) {
      incidente.trabajadorAfectadoId = dto.trabajador_afectado_id;
      if (dto.trabajador_afectado_id) {
        const trabajador = await this.trabajadorRepository.findOne({
          where: { id: dto.trabajador_afectado_id },
        });
        if (trabajador) {
          incidente.nombreTrabajadorSnapshot = trabajador.nombreCompleto;
        }
      }
    }
    if (dto.area_id !== undefined) incidente.areaId = dto.area_id;
    if (dto.responsable_investigacion_id !== undefined)
      incidente.responsableInvestigacionId = dto.responsable_investigacion_id;

    await this.incidenteRepository.save(incidente);

    // Notificación si cambió a Grave o Fatal
    if (
      dto.severidad &&
      (dto.severidad === SeveridadIncidente.Grave ||
        dto.severidad === SeveridadIncidente.Fatal)
    ) {
      console.log(
        `⚠️ ALERTA: Incidente actualizado a ${dto.severidad}: ${incidente.id}`,
      );
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const incidente = await this.incidenteRepository.findOne({ where: { id } });

    if (!incidente) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    // No permitir eliminar incidentes cerrados (integridad legal)
    if (incidente.estado === EstadoIncidente.Cerrado) {
      throw new BadRequestException(
        'No se puede eliminar un incidente que está Cerrado',
      );
    }

    await this.incidenteRepository.remove(incidente);
  }
}
