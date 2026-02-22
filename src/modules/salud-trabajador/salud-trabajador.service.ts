import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaludTrabajador } from './entities/salud-trabajador.entity';
import { HabitoNocivo, TipoHabitoNocivo } from './entities/habito-nocivo.entity';
import { AusentismoMedico } from './entities/ausentismo-medico.entity';
import { UpdateSaludTrabajadorDto } from './dto/update-salud-trabajador.dto';
import { ResponseSaludTrabajadorDto } from './dto/response-salud-trabajador.dto';
import { ResponseHabitoNocivoDto } from './dto/response-habito-nocivo.dto';
import { ResponseAusentismoMedicoDto } from './dto/response-ausentismo.dto';
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
    antecedente_padre: s.antecedentePadre,
    antecedente_madre: s.antecedenteMadre,
    antecedente_hermanos: s.antecedenteHermanos,
    antecedente_esposo: s.antecedenteEsposo,
    nro_hijos_fallecidos: s.nroHijosFallecidos,
    tags_familiares: s.tagsFamiliares,
  };
}

/** Palabras clave para extraer tags de antecedentes familiares (analítica) */
const KEYWORDS_FAMILIA = [
  'diabetes', 'hta', 'hipertensión', 'hipertension', 'cáncer', 'cancer', 'neoplasia',
  'infarto', 'asma', 'alergias', 'alergia', 'tbc', 'tuberculosis', 'hepatitis',
  'cardiopatía', 'cardiopatia', 'obesidad', 'dislipidemia', 'tiroides',
  'depresión', 'depresion', 'ansiedad', 'epilepsia', 'convulsiones',
];

function extraerTagsFamiliares(padre: string | null, madre: string | null, hermanos: string | null, esposo: string | null): string[] {
  const texto = [padre, madre, hermanos, esposo].filter(Boolean).join(' ').toLowerCase();
  if (!texto.trim()) return [];
  const tags: string[] = [];
  for (const kw of KEYWORDS_FAMILIA) {
    if (texto.includes(kw) && !tags.includes(kw)) {
      tags.push(kw);
    }
  }
  return tags;
}

function toResponseAusentismo(a: AusentismoMedico): ResponseAusentismoMedicoDto {
  return {
    id: a.id,
    enfermedad_accidente: a.enfermedadAccidente,
    asociado_trabajo: a.asociadoTrabajo,
    anio: a.anio,
    dias_descanso: a.diasDescanso,
    trabajador_id: a.trabajadorId,
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
    @InjectRepository(AusentismoMedico)
    private readonly ausentismosRepo: Repository<AusentismoMedico>,
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

  /** Obtiene todos los datos de salud del trabajador (antecedentes + hábitos + familiares + ausentismos) */
  async findAllByTrabajadorId(
    trabajadorId: string,
  ): Promise<{
    antecedentes_patologicos: ResponseSaludTrabajadorDto | null;
    habitos_nocivos: ResponseHabitoNocivoDto[];
    ausentismos: ResponseAusentismoMedicoDto[];
    nro_hijos_vivos: number | null;
  }> {
    const [trabajador, antecedentes, habitos, ausentismos] = await Promise.all([
      this.trabajadoresService.findOne(trabajadorId),
      this.findSaludByTrabajadorId(trabajadorId),
      this.findHabitosByTrabajadorId(trabajadorId),
      this.findAusentismosByTrabajadorId(trabajadorId),
    ]);
    return {
      antecedentes_patologicos: antecedentes,
      habitos_nocivos: habitos,
      ausentismos,
      nro_hijos_vivos: trabajador.nro_hijos_vivos ?? null,
    };
  }

  async findAusentismosByTrabajadorId(trabajadorId: string): Promise<ResponseAusentismoMedicoDto[]> {
    await this.trabajadoresService.findOne(trabajadorId);
    const list = await this.ausentismosRepo.find({
      where: { trabajadorId },
      order: { anio: 'DESC' },
    });
    return list.map(toResponseAusentismo);
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
    if (dto.antecedente_padre !== undefined) salud.antecedentePadre = dto.antecedente_padre ?? null;
    if (dto.antecedente_madre !== undefined) salud.antecedenteMadre = dto.antecedente_madre ?? null;
    if (dto.antecedente_hermanos !== undefined) salud.antecedenteHermanos = dto.antecedente_hermanos ?? null;
    if (dto.antecedente_esposo !== undefined) salud.antecedenteEsposo = dto.antecedente_esposo ?? null;
    if (dto.nro_hijos_fallecidos !== undefined) salud.nroHijosFallecidos = dto.nro_hijos_fallecidos ?? null;

    salud.tagsFamiliares = extraerTagsFamiliares(
      salud.antecedentePadre,
      salud.antecedenteMadre,
      salud.antecedenteHermanos,
      salud.antecedenteEsposo,
    );

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

  async upsertAusentismosBulk(
    trabajadorId: string,
    items: Array<{ id?: string; enfermedad_accidente: string; asociado_trabajo: boolean; anio: number; dias_descanso: number }>,
  ): Promise<ResponseAusentismoMedicoDto[]> {
    await this.trabajadoresService.findOne(trabajadorId);
    const results: ResponseAusentismoMedicoDto[] = [];

    for (const item of items) {
      if (item.id) {
        const existing = await this.ausentismosRepo.findOne({
          where: { id: item.id, trabajadorId },
        });
        if (existing) {
          existing.enfermedadAccidente = item.enfermedad_accidente;
          existing.asociadoTrabajo = item.asociado_trabajo;
          existing.anio = item.anio;
          existing.diasDescanso = item.dias_descanso;
          const saved = await this.ausentismosRepo.save(existing);
          results.push(toResponseAusentismo(saved));
          continue;
        }
      }
      const entity = this.ausentismosRepo.create({
        trabajadorId,
        enfermedadAccidente: item.enfermedad_accidente,
        asociadoTrabajo: item.asociado_trabajo,
        anio: item.anio,
        diasDescanso: item.dias_descanso,
      });
      const saved = await this.ausentismosRepo.save(entity);
      results.push(toResponseAusentismo(saved));
    }

    return results;
  }

  /** Sugerencias de enfermedad/accidente para autocompletado en absentismo */
  async sugerenciasEnfermedadAccidente(q: string, limit = 20): Promise<string[]> {
    const trimmed = (q || '').trim();
    if (trimmed.length >= 2) {
      const result = await this.ausentismosRepo
        .createQueryBuilder('a')
        .select('DISTINCT a.enfermedad_accidente')
        .where('a.enfermedad_accidente ILIKE :q', { q: `%${trimmed}%` })
        .andWhere('a.deleted_at IS NULL')
        .orderBy('a.enfermedad_accidente')
        .limit(limit)
        .getRawMany();
      const fromDb = result.map((r) => r.enfermedad_accidente).filter(Boolean);
      if (fromDb.length > 0) return fromDb;
    }
    const comunes = [
      'Gripe', 'Resfriado', 'Lumbago', 'Dorsalgia', 'Cervicalgia', 'Accidente de tránsito',
      'Accidente laboral', 'Gastroenteritis', 'Infección respiratoria', 'Cefalea',
      'Traumatismo', 'Esguince', 'Fractura', 'Herida', 'Quemadura', 'Dermatitis',
      'Conjuntivitis', 'Otitis', 'Faringitis', 'Bronquitis', 'Neumonía', 'COVID-19',
    ];
    if (!trimmed) return comunes.slice(0, limit);
    return comunes.filter((c) => c.toLowerCase().includes(trimmed.toLowerCase())).slice(0, limit);
  }
}
