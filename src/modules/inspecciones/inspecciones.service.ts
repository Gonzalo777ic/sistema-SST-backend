import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspeccion, EstadoInspeccion } from './entities/inspeccion.entity';
import { HallazgoInspeccion, EstadoHallazgo } from './entities/hallazgo-inspeccion.entity';
import { CreateInspeccionDto } from './dto/create-inspeccion.dto';
import { UpdateInspeccionDto } from './dto/update-inspeccion.dto';
import { ResponseInspeccionDto } from './dto/response-inspeccion.dto';

@Injectable()
export class InspeccionesService {
  constructor(
    @InjectRepository(Inspeccion)
    private readonly inspeccionRepository: Repository<Inspeccion>,
    @InjectRepository(HallazgoInspeccion)
    private readonly hallazgoRepository: Repository<HallazgoInspeccion>,
  ) {}

  async create(dto: CreateInspeccionDto): Promise<ResponseInspeccionDto> {
    const inspeccion = this.inspeccionRepository.create({
      tipoInspeccion: dto.tipo_inspeccion,
      fechaInspeccion: new Date(dto.fecha_inspeccion),
      puntuacion: dto.puntuacion ?? 100,
      observaciones: dto.observaciones ?? null,
      fotosGenerales: dto.fotos_generales ?? null,
      estado: dto.estado ?? EstadoInspeccion.Planificada,
      empresaId: dto.empresa_id,
      areaId: dto.area_id ?? null,
      inspectorId: dto.inspector_id,
    });

    const saved = await this.inspeccionRepository.save(inspeccion);

    // Guardar hallazgos
    if (dto.hallazgos && dto.hallazgos.length > 0) {
      const hallazgos = dto.hallazgos.map((h) =>
        this.hallazgoRepository.create({
          inspeccion: saved,
          descripcion: h.descripcion,
          criticidad: h.criticidad,
          fotoUrl: h.foto_url ?? null,
          accionCorrectiva: h.accion_correctiva,
          responsableId: h.responsable_id,
          fechaLimite: new Date(h.fecha_limite),
          estadoHallazgo: (h.estado as EstadoHallazgo) ?? EstadoHallazgo.Pendiente,
        }),
      );
      await this.hallazgoRepository.save(hallazgos);

      // Actualizar estado si hay hallazgos pendientes
      if (hallazgos.some((h) => h.estadoHallazgo !== EstadoHallazgo.Corregido)) {
        saved.estado = EstadoInspeccion.ConHallazgosPendientes;
        await this.inspeccionRepository.save(saved);
      }
    }

    return this.findOne(saved.id);
  }

  async findAll(empresaId?: string): Promise<ResponseInspeccionDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const inspecciones = await this.inspeccionRepository.find({
      where,
      relations: ['inspector', 'area', 'hallazgos', 'hallazgos.responsable'],
      order: { fechaInspeccion: 'DESC' },
    });

    return inspecciones.map((i) => ResponseInspeccionDto.fromEntity(i));
  }

  async findOne(id: string): Promise<ResponseInspeccionDto> {
    const inspeccion = await this.inspeccionRepository.findOne({
      where: { id },
      relations: ['inspector', 'area', 'hallazgos', 'hallazgos.responsable'],
    });

    if (!inspeccion) {
      throw new NotFoundException(`Inspección con ID ${id} no encontrada`);
    }

    return ResponseInspeccionDto.fromEntity(inspeccion);
  }

  async update(
    id: string,
    dto: UpdateInspeccionDto,
  ): Promise<ResponseInspeccionDto> {
    const inspeccion = await this.inspeccionRepository.findOne({
      where: { id },
      relations: ['hallazgos'],
    });

    if (!inspeccion) {
      throw new NotFoundException(`Inspección con ID ${id} no encontrada`);
    }

    // Actualizar campos
    Object.assign(inspeccion, {
      tipoInspeccion: dto.tipo_inspeccion ?? inspeccion.tipoInspeccion,
      fechaInspeccion: dto.fecha_inspeccion
        ? new Date(dto.fecha_inspeccion)
        : inspeccion.fechaInspeccion,
      puntuacion: dto.puntuacion ?? inspeccion.puntuacion,
      observaciones: dto.observaciones ?? inspeccion.observaciones,
      fotosGenerales: dto.fotos_generales ?? inspeccion.fotosGenerales,
      estado: dto.estado ?? inspeccion.estado,
    });

    // Sincronizar estado según hallazgos
    if (inspeccion.hallazgos && inspeccion.hallazgos.length > 0) {
      const todosCerrados = inspeccion.hallazgos.every(
        (h) => h.estadoHallazgo === EstadoHallazgo.Corregido,
      );
      if (todosCerrados && inspeccion.estado === EstadoInspeccion.ConHallazgosPendientes) {
        inspeccion.estado = EstadoInspeccion.Completada;
      }
    }

    await this.inspeccionRepository.save(inspeccion);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const inspeccion = await this.inspeccionRepository.findOne({ where: { id } });

    if (!inspeccion) {
      throw new NotFoundException(`Inspección con ID ${id} no encontrada`);
    }

    await this.inspeccionRepository.remove(inspeccion);
  }
}
