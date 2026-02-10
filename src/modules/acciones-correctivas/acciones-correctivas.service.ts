import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { AccionCorrectiva, EstadoAccion, FuenteAccion } from './entities/accion-correctiva.entity';
import { CreateAccionCorrectivaDto } from './dto/create-accion-correctiva.dto';
import { UpdateAccionCorrectivaDto } from './dto/update-accion-correctiva.dto';
import { ResponseAccionCorrectivaDto, AccionesKPIsDto } from './dto/response-accion-correctiva.dto';

@Injectable()
export class AccionesCorrectivasService {
  constructor(
    @InjectRepository(AccionCorrectiva)
    private readonly accionRepository: Repository<AccionCorrectiva>,
  ) {}

  async create(dto: CreateAccionCorrectivaDto): Promise<ResponseAccionCorrectivaDto> {
    const accion = this.accionRepository.create({
      fuente: dto.fuente,
      titulo: dto.titulo,
      descripcion: dto.descripcion || null,
      fechaProgramada: new Date(dto.fecha_programada),
      fechaEjecucion: dto.fecha_ejecucion ? new Date(dto.fecha_ejecucion) : null,
      fechaAprobacion: dto.fecha_aprobacion ? new Date(dto.fecha_aprobacion) : null,
      estado: EstadoAccion.PorAprobar,
      empresaId: dto.empresa_id,
      areaId: dto.area_id || null,
      elaboradoPorId: dto.elaborado_por_id,
      responsableLevantamientoId: dto.responsable_levantamiento_id,
      contratistaId: dto.contratista_id || null,
      sede: dto.sede || null,
      unidad: dto.unidad || null,
    });

    const saved = await this.accionRepository.save(accion);
    return this.findOne(saved.id);
  }

  async findAll(
    empresaId?: string,
    fuente?: FuenteAccion,
    estado?: EstadoAccion,
    responsableNombre?: string,
    titulo?: string,
    unidad?: string,
    areaId?: string,
    sede?: string,
    contratistaId?: string,
    fechaProgramadaDesde?: string,
    fechaProgramadaHasta?: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ResponseAccionCorrectivaDto[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.accionRepository
      .createQueryBuilder('accion')
      .leftJoinAndSelect('accion.empresa', 'empresa')
      .leftJoinAndSelect('accion.area', 'area')
      .leftJoinAndSelect('accion.elaboradoPor', 'elaboradoPor')
      .leftJoinAndSelect('accion.responsableLevantamiento', 'responsableLevantamiento')
      .leftJoinAndSelect('accion.contratista', 'contratista')
      .orderBy('accion.createdAt', 'DESC');

    if (empresaId) {
      queryBuilder.andWhere('accion.empresaId = :empresaId', { empresaId });
    }

    if (fuente) {
      queryBuilder.andWhere('accion.fuente = :fuente', { fuente });
    }

    if (estado) {
      queryBuilder.andWhere('accion.estado = :estado', { estado });
    }

    if (responsableNombre) {
      queryBuilder.andWhere(
        'responsableLevantamiento.nombreCompleto ILIKE :responsableNombre',
        { responsableNombre: `%${responsableNombre}%` },
      );
    }

    if (titulo) {
      queryBuilder.andWhere('accion.titulo ILIKE :titulo', {
        titulo: `%${titulo}%`,
      });
    }

    if (unidad) {
      queryBuilder.andWhere('accion.unidad ILIKE :unidad', {
        unidad: `%${unidad}%`,
      });
    }

    if (areaId) {
      queryBuilder.andWhere('accion.areaId = :areaId', { areaId });
    }

    if (sede) {
      queryBuilder.andWhere('accion.sede ILIKE :sede', { sede: `%${sede}%` });
    }

    if (contratistaId) {
      queryBuilder.andWhere('accion.contratistaId = :contratistaId', {
        contratistaId,
      });
    }

    if (fechaProgramadaDesde) {
      queryBuilder.andWhere('accion.fechaProgramada >= :fechaProgramadaDesde', {
        fechaProgramadaDesde: new Date(fechaProgramadaDesde),
      });
    }

    if (fechaProgramadaHasta) {
      queryBuilder.andWhere('accion.fechaProgramada <= :fechaProgramadaHasta', {
        fechaProgramadaHasta: new Date(fechaProgramadaHasta),
      });
    }

    const total = await queryBuilder.getCount();

    // Paginación
    const pageNum = page || 1;
    const limitNum = limit || 50;
    const skip = (pageNum - 1) * limitNum;

    queryBuilder.skip(skip).take(limitNum);

    const acciones = await queryBuilder.getMany();

    return {
      data: acciones.map((accion) => ResponseAccionCorrectivaDto.fromEntity(accion)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<ResponseAccionCorrectivaDto> {
    const accion = await this.accionRepository.findOne({
      where: { id },
      relations: [
        'empresa',
        'area',
        'elaboradoPor',
        'responsableLevantamiento',
        'contratista',
      ],
    });

    if (!accion) {
      throw new NotFoundException(`Acción correctiva con ID ${id} no encontrada`);
    }

    return ResponseAccionCorrectivaDto.fromEntity(accion);
  }

  async update(
    id: string,
    dto: UpdateAccionCorrectivaDto,
  ): Promise<ResponseAccionCorrectivaDto> {
    const accion = await this.accionRepository.findOne({ where: { id } });

    if (!accion) {
      throw new NotFoundException(`Acción correctiva con ID ${id} no encontrada`);
    }

    if (dto.fuente !== undefined) accion.fuente = dto.fuente;
    if (dto.titulo !== undefined) accion.titulo = dto.titulo;
    if (dto.descripcion !== undefined) accion.descripcion = dto.descripcion;
    if (dto.fecha_programada !== undefined)
      accion.fechaProgramada = new Date(dto.fecha_programada);
    if (dto.fecha_ejecucion !== undefined)
      accion.fechaEjecucion = dto.fecha_ejecucion ? new Date(dto.fecha_ejecucion) : null;
    if (dto.fecha_aprobacion !== undefined)
      accion.fechaAprobacion = dto.fecha_aprobacion ? new Date(dto.fecha_aprobacion) : null;
    if (dto.estado !== undefined) accion.estado = dto.estado;
    if (dto.area_id !== undefined) accion.areaId = dto.area_id || null;
    if (dto.responsable_levantamiento_id !== undefined)
      accion.responsableLevantamientoId = dto.responsable_levantamiento_id;
    if (dto.contratista_id !== undefined)
      accion.contratistaId = dto.contratista_id || null;
    if (dto.sede !== undefined) accion.sede = dto.sede || null;
    if (dto.unidad !== undefined) accion.unidad = dto.unidad || null;

    // Actualizar estado automáticamente si corresponde
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaProgramada = new Date(accion.fechaProgramada);
    fechaProgramada.setHours(0, 0, 0, 0);

    if (
      accion.estado === EstadoAccion.Pendiente &&
      fechaProgramada < hoy &&
      !accion.fechaEjecucion
    ) {
      accion.estado = EstadoAccion.Atrasado;
    }

    await this.accionRepository.save(accion);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const accion = await this.accionRepository.findOne({ where: { id } });

    if (!accion) {
      throw new NotFoundException(`Acción correctiva con ID ${id} no encontrada`);
    }

    await this.accionRepository.softRemove(accion);
  }

  async getKPIs(empresaId?: string): Promise<AccionesKPIsDto> {
    const queryBuilder = this.accionRepository.createQueryBuilder('accion');

    if (empresaId) {
      queryBuilder.andWhere('accion.empresaId = :empresaId', { empresaId });
    }

    const total = await queryBuilder.getCount();

    const aprobados = await queryBuilder
      .clone()
      .andWhere('accion.estado = :estado', { estado: EstadoAccion.Aprobado })
      .getCount();

    const pendientes = await queryBuilder
      .clone()
      .andWhere('accion.estado IN (:...estados)', {
        estados: [
          EstadoAccion.PorAprobar,
          EstadoAccion.Pendiente,
          EstadoAccion.Atrasado,
        ],
      })
      .getCount();

    return {
      aprobados,
      pendientes,
      total,
    };
  }
}
