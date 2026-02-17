import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigCapacitacion } from './entities/config-capacitacion.entity';
import { ResponseConfigCapacitacionDto } from './dto/response-config-capacitacion.dto';
import { UpdateConfigCapacitacionDto } from './dto/update-config-capacitacion.dto';

const TIPOS_DEFAULT = [
  'CAPACITACIÓN',
  'CAPACITACIÓN OBLIGATORIA',
  'CHARLA',
  'CHARLA 5 MIN',
  'CHARLA DE SEGURIDAD Y SALUD EN EL TRABAJO',
  'PAUSAS ACTIVAS',
  'SIMULACRO DE EMERGENCIA',
  'TOMA DE CONCIENCIA',
];

const GRUPOS_DEFAULT = ['OBLIGATORIAS SST', 'Otros'];

const UBICACIONES_DEFAULT = ['Oficina', 'Producción', 'Comedor', 'SHOWROOM'];

@Injectable()
export class ConfigCapacitacionesService {
  constructor(
    @InjectRepository(ConfigCapacitacion)
    private readonly configRepo: Repository<ConfigCapacitacion>,
  ) {}

  async getConfig(): Promise<ResponseConfigCapacitacionDto> {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create({
        notaMinimaAprobatoria: 11,
        bloquearEvaluacionNotaMenorIgual: 0,
        limiteIntentos: 3,
        bloquearDespuesAprobacion: true,
        habilitarFirmaSoloAprobados: false,
        habilitarEncuestaSatisfaccion: false,
        tipos: TIPOS_DEFAULT,
        grupos: GRUPOS_DEFAULT,
        ubicaciones: UBICACIONES_DEFAULT,
        responsablesCertificacion: [],
        registroAsistencia: null,
        firmasCertificado: {
          responsable_rrhh: true,
          responsable_sst: true,
          capacitador: true,
          responsable_certificacion: true,
        },
      });
      await this.configRepo.save(config);
    }
    return ResponseConfigCapacitacionDto.fromEntity(config);
  }

  async updateConfig(dto: UpdateConfigCapacitacionDto): Promise<ResponseConfigCapacitacionDto> {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create({
        notaMinimaAprobatoria: 11,
        bloquearEvaluacionNotaMenorIgual: 0,
        limiteIntentos: 3,
        bloquearDespuesAprobacion: true,
        habilitarFirmaSoloAprobados: false,
        habilitarEncuestaSatisfaccion: false,
        tipos: TIPOS_DEFAULT,
        grupos: GRUPOS_DEFAULT,
        ubicaciones: UBICACIONES_DEFAULT,
        responsablesCertificacion: [],
        registroAsistencia: null,
        firmasCertificado: {
          responsable_rrhh: true,
          responsable_sst: true,
          capacitador: true,
          responsable_certificacion: true,
        },
      });
    }

    if (dto.nota_minima_aprobatoria !== undefined) config.notaMinimaAprobatoria = dto.nota_minima_aprobatoria;
    if (dto.bloquear_evaluacion_nota_menor_igual !== undefined)
      config.bloquearEvaluacionNotaMenorIgual = dto.bloquear_evaluacion_nota_menor_igual;
    if (dto.limite_intentos !== undefined) config.limiteIntentos = dto.limite_intentos;
    if (dto.bloquear_despues_aprobacion !== undefined) config.bloquearDespuesAprobacion = dto.bloquear_despues_aprobacion;
    if (dto.habilitar_firma_solo_aprobados !== undefined)
      config.habilitarFirmaSoloAprobados = dto.habilitar_firma_solo_aprobados;
    if (dto.habilitar_encuesta_satisfaccion !== undefined)
      config.habilitarEncuestaSatisfaccion = dto.habilitar_encuesta_satisfaccion;
    if (dto.tipos !== undefined) config.tipos = dto.tipos;
    if (dto.grupos !== undefined) config.grupos = dto.grupos;
    if (dto.ubicaciones !== undefined) config.ubicaciones = dto.ubicaciones;
    if (dto.responsables_certificacion !== undefined) config.responsablesCertificacion = dto.responsables_certificacion;
    if (dto.registro_asistencia !== undefined) config.registroAsistencia = dto.registro_asistencia;
    if (dto.firmas_certificado !== undefined) {
      const prev = config.firmasCertificado ?? {
        responsable_rrhh: true,
        responsable_sst: true,
        capacitador: true,
        responsable_certificacion: true,
      };
      config.firmasCertificado = {
        responsable_rrhh: dto.firmas_certificado.responsable_rrhh ?? prev.responsable_rrhh,
        responsable_sst: dto.firmas_certificado.responsable_sst ?? prev.responsable_sst,
        capacitador: dto.firmas_certificado.capacitador ?? prev.capacitador,
        responsable_certificacion: dto.firmas_certificado.responsable_certificacion ?? prev.responsable_certificacion,
      };
    }

    const saved = await this.configRepo.save(config);
    return ResponseConfigCapacitacionDto.fromEntity(saved);
  }
}
