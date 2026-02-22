import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AntecedenteOcupacional } from './entities/antecedente-ocupacional.entity';
import { CreateAntecedenteOcupacionalDto } from './dto/create-antecedente-ocupacional.dto';
import { UpdateAntecedenteOcupacionalDto } from './dto/update-antecedente-ocupacional.dto';
import { ResponseAntecedenteOcupacionalDto } from './dto/response-antecedente-ocupacional.dto';
import { TrabajadoresService } from '../trabajadores/trabajadores.service';

function calcularTiempoTotal(fechaInicio: Date, fechaFin: Date | null): string {
  const fin = fechaFin || new Date();
  const diffMs = fin.getTime() - fechaInicio.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 30) return `${diffDays} días`;
  if (diffDays < 365) {
    const meses = Math.floor(diffDays / 30);
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
  const años = Math.floor(diffDays / 365);
  const restoMeses = Math.floor((diffDays % 365) / 30);
  const partes: string[] = [`${años} ${años === 1 ? 'año' : 'años'}`];
  if (restoMeses > 0) partes.push(`${restoMeses} ${restoMeses === 1 ? 'mes' : 'meses'}`);
  return partes.join(' ');
}

function toResponse(entity: AntecedenteOcupacional): ResponseAntecedenteOcupacionalDto {
  return {
    id: entity.id,
    empresa: entity.empresa,
    area_trabajo: entity.areaTrabajo,
    ocupacion: entity.ocupacion,
    fecha_inicio: entity.fechaInicio.toISOString().slice(0, 10),
    fecha_fin: entity.fechaFin ? entity.fechaFin.toISOString().slice(0, 10) : null,
    tiempo_total: entity.tiempoTotal,
    riesgos: entity.riesgos,
    epp_utilizado: entity.eppUtilizado,
    trabajador_id: entity.trabajadorId,
  };
}

@Injectable()
export class AntecedentesOcupacionalesService {
  constructor(
    @InjectRepository(AntecedenteOcupacional)
    private readonly repo: Repository<AntecedenteOcupacional>,
    private readonly trabajadoresService: TrabajadoresService,
  ) {}

  async findByTrabajadorId(trabajadorId: string): Promise<ResponseAntecedenteOcupacionalDto[]> {
    await this.trabajadoresService.findOne(trabajadorId);
    const list = await this.repo.find({
      where: { trabajadorId },
      order: { fechaInicio: 'DESC' },
    });
    return list.map(toResponse);
  }

  async create(
    trabajadorId: string,
    dto: CreateAntecedenteOcupacionalDto,
  ): Promise<ResponseAntecedenteOcupacionalDto> {
    await this.trabajadoresService.findOne(trabajadorId);
    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaFin = dto.fecha_fin ? new Date(dto.fecha_fin) : null;
    const tiempoTotal = dto.tiempo_total ?? calcularTiempoTotal(fechaInicio, fechaFin);

    const entity = this.repo.create({
      trabajadorId,
      empresa: dto.empresa,
      areaTrabajo: dto.area_trabajo ?? null,
      ocupacion: dto.ocupacion,
      fechaInicio,
      fechaFin,
      tiempoTotal,
      riesgos: dto.riesgos ?? null,
      eppUtilizado: dto.epp_utilizado ?? null,
    });
    const saved = await this.repo.save(entity);
    return toResponse(saved);
  }

  async update(
    trabajadorId: string,
    antecedenteId: string,
    dto: UpdateAntecedenteOcupacionalDto,
  ): Promise<ResponseAntecedenteOcupacionalDto> {
    const entity = await this.repo.findOne({
      where: { id: antecedenteId, trabajadorId },
    });
    if (!entity) throw new NotFoundException('Antecedente ocupacional no encontrado');

    if (dto.fecha_inicio != null) entity.fechaInicio = new Date(dto.fecha_inicio);
    if (dto.fecha_fin !== undefined) entity.fechaFin = dto.fecha_fin ? new Date(dto.fecha_fin) : null;
    if (dto.empresa != null) entity.empresa = dto.empresa;
    if (dto.area_trabajo !== undefined) entity.areaTrabajo = dto.area_trabajo ?? null;
    if (dto.ocupacion != null) entity.ocupacion = dto.ocupacion;
    if (dto.riesgos !== undefined) entity.riesgos = dto.riesgos ?? null;
    if (dto.epp_utilizado !== undefined) entity.eppUtilizado = dto.epp_utilizado ?? null;

    entity.tiempoTotal =
      dto.tiempo_total ?? calcularTiempoTotal(entity.fechaInicio, entity.fechaFin);

    const saved = await this.repo.save(entity);
    return toResponse(saved);
  }

  async remove(trabajadorId: string, antecedenteId: string): Promise<void> {
    const entity = await this.repo.findOne({
      where: { id: antecedenteId, trabajadorId },
    });
    if (!entity) throw new NotFoundException('Antecedente ocupacional no encontrado');
    await this.repo.softRemove(entity);
  }

  /** Guarda o actualiza múltiples antecedentes (upsert por id). Para la ficha EMO. */
  async upsertBulk(
    trabajadorId: string,
    items: Array<{
      id?: string;
      empresa: string;
      area_trabajo?: string;
      ocupacion: string;
      fecha_inicio: string;
      fecha_fin?: string;
      riesgos?: string;
      epp_utilizado?: string;
    }>,
  ): Promise<ResponseAntecedenteOcupacionalDto[]> {
    await this.trabajadoresService.findOne(trabajadorId);
    const results: ResponseAntecedenteOcupacionalDto[] = [];

    for (const item of items) {
      const fechaInicio = new Date(item.fecha_inicio);
      const fechaFin = item.fecha_fin ? new Date(item.fecha_fin) : null;
      const tiempoTotal = calcularTiempoTotal(fechaInicio, fechaFin);

      if (item.id) {
        const existing = await this.repo.findOne({
          where: { id: item.id, trabajadorId },
        });
        if (existing) {
          existing.empresa = item.empresa;
          existing.areaTrabajo = item.area_trabajo ?? null;
          existing.ocupacion = item.ocupacion;
          existing.fechaInicio = fechaInicio;
          existing.fechaFin = fechaFin;
          existing.tiempoTotal = tiempoTotal;
          existing.riesgos = item.riesgos ?? null;
          existing.eppUtilizado = item.epp_utilizado ?? null;
          const saved = await this.repo.save(existing);
          results.push(toResponse(saved));
          continue;
        }
      }

      const entity = this.repo.create({
        trabajadorId,
        empresa: item.empresa,
        areaTrabajo: item.area_trabajo ?? null,
        ocupacion: item.ocupacion,
        fechaInicio,
        fechaFin,
        tiempoTotal,
        riesgos: item.riesgos ?? null,
        eppUtilizado: item.epp_utilizado ?? null,
      });
      const saved = await this.repo.save(entity);
      results.push(toResponse(saved));
    }

    return results;
  }
}
