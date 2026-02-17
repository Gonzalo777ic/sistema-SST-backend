import {
  TipoExamen,
  ResultadoExamen,
  EstadoExamen,
} from '../entities/examen-medico.entity';

export class ResponseExamenMedicoDto {
  id: string;
  trabajador_id: string;
  trabajador_nombre: string | null;
  trabajador_documento: string | null;
  proyecto: string | null;
  sede: string | null;
  tipo_examen: TipoExamen;
  hora_programacion: string | null;
  perfil_emo_id: string | null;
  adicionales: string | null;
  recomendaciones_personalizadas: string | null;
  fecha_programada: string;
  fecha_realizado: string | null;
  fecha_vencimiento: string | null;
  centro_medico: string;
  medico_evaluador: string | null;
  resultado: ResultadoExamen;
  restricciones: string | null;
  observaciones: string | null;
  resultado_archivo_url: string | null;
  /** Indica si existe archivo EMO (para admin sin acceso a descarga) */
  resultado_archivo_existe?: boolean;
  estado: EstadoExamen;
  revisado_por_doctor: boolean;
  doctor_interno_id: string | null;
  fecha_revision_doctor: string | null;
  cargado_por: string | null;
  cargado_por_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(examen: {
    id: string;
    trabajadorId: string;
    tipoExamen: TipoExamen;
    fechaProgramada: Date;
    fechaRealizado: Date | null;
    fechaVencimiento: Date | null;
    centroMedico: string;
    medicoEvaluador: string | null;
    resultado: ResultadoExamen;
    restricciones: string | null;
    observaciones: string | null;
    resultadoArchivoUrl: string | null;
    estado: EstadoExamen;
    revisadoPorDoctor: boolean;
    doctorInternoId: string | null;
    fechaRevisionDoctor: Date | null;
    cargadoPorId: string;
    proyecto?: string | null;
    horaProgramacion?: string | null;
    perfilEmoId?: string | null;
    adicionales?: string | null;
    recomendacionesPersonalizadas?: string | null;
    trabajador?: { nombreCompleto: string; documentoIdentidad?: string; sede?: string | null } | null;
    cargadoPor?: { nombreCompleto?: string; dni?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseExamenMedicoDto {
    const toDateStr = (d: Date | string | null): string | null => {
      if (!d) return null;
      if (typeof d === 'string') return d.split('T')[0];
      return d.toISOString().split('T')[0];
    };
    const dto = new ResponseExamenMedicoDto();
    dto.id = examen.id;
    dto.trabajador_id = examen.trabajadorId;
    dto.trabajador_nombre = examen.trabajador?.nombreCompleto || null;
    dto.trabajador_documento = examen.trabajador?.documentoIdentidad ?? null;
    dto.proyecto = examen.proyecto ?? null;
    dto.sede = examen.trabajador?.sede ?? null;
    dto.tipo_examen = examen.tipoExamen;
    dto.hora_programacion = examen.horaProgramacion ?? null;
    dto.perfil_emo_id = examen.perfilEmoId ?? null;
    dto.adicionales = examen.adicionales ?? null;
    dto.recomendaciones_personalizadas = examen.recomendacionesPersonalizadas ?? null;
    dto.fecha_programada = toDateStr(examen.fechaProgramada as Date | string) ?? '';
    dto.fecha_realizado = toDateStr(examen.fechaRealizado as Date | string | null);
    dto.fecha_vencimiento = toDateStr(examen.fechaVencimiento as Date | string | null);
    dto.centro_medico = examen.centroMedico;
    dto.medico_evaluador = examen.medicoEvaluador ?? null;
    dto.resultado = examen.resultado;
    dto.restricciones = examen.restricciones;
    dto.observaciones = examen.observaciones;
    dto.resultado_archivo_url = examen.resultadoArchivoUrl;
    dto.estado = examen.estado;
    dto.revisado_por_doctor = examen.revisadoPorDoctor;
    dto.doctor_interno_id = examen.doctorInternoId;
    dto.fecha_revision_doctor = examen.fechaRevisionDoctor
      ? (typeof examen.fechaRevisionDoctor === 'string'
          ? examen.fechaRevisionDoctor
          : examen.fechaRevisionDoctor.toISOString())
      : null;
    dto.cargado_por =
      examen.cargadoPor?.nombreCompleto || examen.cargadoPor?.dni || null;
    dto.cargado_por_id = examen.cargadoPorId;
    dto.createdAt = examen.createdAt;
    dto.updatedAt = examen.updatedAt;
    return dto;
  }
}
