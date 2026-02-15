import {
  ResponsableCertificacionItem,
  RegistroAsistenciaItem,
  FirmasCertificado,
} from '../entities/config-capacitacion.entity';

export class ResponseConfigCapacitacionDto {
  id: string;
  nota_minima_aprobatoria: number;
  bloquear_evaluacion_nota_menor_igual: number;
  limite_intentos: number;
  bloquear_despues_aprobacion: boolean;
  habilitar_firma_solo_aprobados: boolean;
  habilitar_encuesta_satisfaccion: boolean;
  tipos: string[];
  grupos: string[];
  ubicaciones: string[];
  responsables_certificacion: ResponsableCertificacionItem[];
  registro_asistencia: RegistroAsistenciaItem[] | null;
  firmas_certificado: FirmasCertificado | null;
  created_at: Date;
  updated_at: Date;

  static fromEntity(entity: {
    id: string;
    notaMinimaAprobatoria: number;
    bloquearEvaluacionNotaMenorIgual: number;
    limiteIntentos: number;
    bloquearDespuesAprobacion: boolean;
    habilitarFirmaSoloAprobados: boolean;
    habilitarEncuestaSatisfaccion: boolean;
    tipos: string[];
    grupos: string[];
    ubicaciones: string[];
    responsablesCertificacion: ResponsableCertificacionItem[];
    registroAsistencia: RegistroAsistenciaItem[] | null;
    firmasCertificado: FirmasCertificado | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseConfigCapacitacionDto {
    const dto = new ResponseConfigCapacitacionDto();
    dto.id = entity.id;
    dto.nota_minima_aprobatoria = entity.notaMinimaAprobatoria;
    dto.bloquear_evaluacion_nota_menor_igual = entity.bloquearEvaluacionNotaMenorIgual;
    dto.limite_intentos = entity.limiteIntentos;
    dto.bloquear_despues_aprobacion = entity.bloquearDespuesAprobacion;
    dto.habilitar_firma_solo_aprobados = entity.habilitarFirmaSoloAprobados;
    dto.habilitar_encuesta_satisfaccion = entity.habilitarEncuestaSatisfaccion;
    dto.tipos = entity.tipos ?? [];
    dto.grupos = entity.grupos ?? [];
    dto.ubicaciones = entity.ubicaciones ?? [];
    dto.responsables_certificacion = entity.responsablesCertificacion ?? [];
    dto.registro_asistencia = entity.registroAsistencia;
    dto.firmas_certificado = entity.firmasCertificado;
    dto.created_at = entity.createdAt;
    dto.updated_at = entity.updatedAt;
    return dto;
  }
}
