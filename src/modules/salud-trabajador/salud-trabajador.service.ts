import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaludTrabajador } from './entities/salud-trabajador.entity';
import { HabitoNocivo, TipoHabitoNocivo } from './entities/habito-nocivo.entity';
import { UpdateSaludTrabajadorDto } from './dto/update-salud-trabajador.dto';
import { ResponseSaludTrabajadorDto } from './dto/response-salud-trabajador.dto';
import { ResponseHabitoNocivoDto } from './dto/response-habito-nocivo.dto';
import { TrabajadoresService } from '../trabajadores/trabajadores.service';

function toResponseSalud(s: SaludTrabajador): ResponseSaludTrabajadorDto {
  return {
    id: s.id,
    trabajador_id: s.trabajadorId,
    alergias: s.alergias,
    diabetes: s.diabetes,
    tbc: s.tbc,
    hepatitis_b: s.hepatitisB,
    asma: s.asma,
    hta: s.hta,
    its: s.its,
    tifoidea: s.tifoidea,
    bronquitis: s.bronquitis,
    neoplasia: s.neoplasia,
    convulsiones: s.convulsiones,
    quemaduras: s.quemaduras,
    cirugias: s.cirugias,
    intoxicaciones: s.intoxicaciones,
    otros: s.otros,
    detalle_cirugias: s.detalleCirugias,
    detalle_otros: s.detalleOtros,
  };
}

function toResponseHabito(h: HabitoNocivo): ResponseHabitoNocivoDto {
  return {
    id: h.id,
    tipo: h.tipo,
    cantidad: h.cantidad,
    frecuencia: h.frecuencia,
    trabajador_id: h.trabajadorId,
  };
}

@Injectable()
export class SaludTrabajadorService {
  constructor(
    @InjectRepository(SaludTrabajador)
    private readonly saludRepo: Repository<SaludTrabajador>,
    @InjectRepository(HabitoNocivo)
    private readonly habitosRepo: Repository<HabitoNocivo>,
    private readonly trabajadoresService: TrabajadoresService,
  ) {}

  async findSaludByTrabajadorId(trabajadorId: string): Promise<ResponseSaludTrabajadorDto | null> {
    await this.trabajadoresService.findOne(trabajadorId);
    const salud = await this.saludRepo.findOne({ where: { trabajadorId } });
    return salud ? toResponseSalud(salud) : null;
  }

  async findHabitosByTrabajadorId(trabajadorId: string): Promise<ResponseHabitoNocivoDto[]> {
    await this.trabajadoresService.findOne(trabajadorId);
    const list = await this.habitosRepo.find({
      where: { trabajadorId },
      order: { tipo: 'ASC' },
    });
    return list.map(toResponseHabito);
  }

  /** Obtiene todos los datos de salud del trabajador (antecedentes + hábitos) */
  async findAllByTrabajadorId(
    trabajadorId: string,
  ): Promise<{
    antecedentes_patologicos: ResponseSaludTrabajadorDto | null;
    habitos_nocivos: ResponseHabitoNocivoDto[];
  }> {
    const [antecedentes, habitos] = await Promise.all([
      this.findSaludByTrabajadorId(trabajadorId),
      this.findHabitosByTrabajadorId(trabajadorId),
    ]);
    return {
      antecedentes_patologicos: antecedentes,
      habitos_nocivos: habitos,
    };
  }

  async upsertSalud(
    trabajadorId: string,
    dto: UpdateSaludTrabajadorDto,
  ): Promise<ResponseSaludTrabajadorDto> {
    await this.trabajadoresService.findOne(trabajadorId);
    let salud = await this.saludRepo.findOne({ where: { trabajadorId } });
    if (!salud) {
      salud = this.saludRepo.create({ trabajadorId });
    }
    if (dto.alergias !== undefined) salud.alergias = dto.alergias;
    if (dto.diabetes !== undefined) salud.diabetes = dto.diabetes;
    if (dto.tbc !== undefined) salud.tbc = dto.tbc;
    if (dto.hepatitis_b !== undefined) salud.hepatitisB = dto.hepatitis_b;
    if (dto.asma !== undefined) salud.asma = dto.asma;
    if (dto.hta !== undefined) salud.hta = dto.hta;
    if (dto.its !== undefined) salud.its = dto.its;
    if (dto.tifoidea !== undefined) salud.tifoidea = dto.tifoidea;
    if (dto.bronquitis !== undefined) salud.bronquitis = dto.bronquitis;
    if (dto.neoplasia !== undefined) salud.neoplasia = dto.neoplasia;
    if (dto.convulsiones !== undefined) salud.convulsiones = dto.convulsiones;
    if (dto.quemaduras !== undefined) salud.quemaduras = dto.quemaduras;
    if (dto.cirugias !== undefined) salud.cirugias = dto.cirugias;
    if (dto.intoxicaciones !== undefined) salud.intoxicaciones = dto.intoxicaciones;
    if (dto.otros !== undefined) salud.otros = dto.otros;
    if (dto.detalle_cirugias !== undefined) salud.detalleCirugias = dto.detalle_cirugias ?? null;
    if (dto.detalle_otros !== undefined) salud.detalleOtros = dto.detalle_otros ?? null;

    const saved = await this.saludRepo.save(salud);
    return toResponseSalud(saved);
  }

  async upsertHabitosBulk(
    trabajadorId: string,
    items: Array<{ id?: string; tipo: TipoHabitoNocivo; cantidad?: string; frecuencia?: string }>,
  ): Promise<ResponseHabitoNocivoDto[]> {
    await this.trabajadoresService.findOne(trabajadorId);
    const results: ResponseHabitoNocivoDto[] = [];

    for (const item of items) {
      if (item.id) {
        const existing = await this.habitosRepo.findOne({
          where: { id: item.id, trabajadorId },
        });
        if (existing) {
          existing.cantidad = item.cantidad ?? null;
          existing.frecuencia = item.frecuencia ?? null;
          const saved = await this.habitosRepo.save(existing);
          results.push(toResponseHabito(saved));
          continue;
        }
      }
      const entity = this.habitosRepo.create({
        trabajadorId,
        tipo: item.tipo,
        cantidad: item.cantidad ?? null,
        frecuencia: item.frecuencia ?? null,
      });
      const saved = await this.habitosRepo.save(entity);
      results.push(toResponseHabito(saved));
    }

    return results;
  }
}
