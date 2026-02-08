import {
  TipoExamen,
  ResultadoExamen,
  EstadoExamen,
} from '../entities/examen-medico.entity';

export class ResponseExamenMedicoDto {
  id: string;
  trabajador_id: string;
  trabajador_nombre: string | null;
  tipo_examen: TipoExamen;
  fecha_programada: string;
  fecha_realizado: string | null;
  fecha_vencimiento: string | null;
  centro_medico: string;
  medico_evaluador: string;
  resultado: ResultadoExamen;
  restricciones: string | null;
  observaciones: string | null;
  resultado_archivo_url: string | null;
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
    medicoEvaluador: string;
    resultado: ResultadoExamen;
    restricciones: string | null;
    observaciones: string | null;
    resultadoArchivoUrl: string | null;
    estado: EstadoExamen;
    revisadoPorDoctor: boolean;
    doctorInternoId: string | null;
    fechaRevisionDoctor: Date | null;
    cargadoPorId: string;
    trabajador?: { nombreCompleto: string } | null;
    cargadoPor?: { nombreCompleto?: string; dni?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseExamenMedicoDto {
    const dto = new ResponseExamenMedicoDto();
    dto.id = examen.id;
    dto.trabajador_id = examen.trabajadorId;
    dto.trabajador_nombre = examen.trabajador?.nombreCompleto || null;
    dto.tipo_examen = examen.tipoExamen;
    dto.fecha_programada = examen.fechaProgramada.toISOString().split('T')[0];
    dto.fecha_realizado = examen.fechaRealizado
      ? examen.fechaRealizado.toISOString().split('T')[0]
      : null;
    dto.fecha_vencimiento = examen.fechaVencimiento
      ? examen.fechaVencimiento.toISOString().split('T')[0]
      : null;
    dto.centro_medico = examen.centroMedico;
    dto.medico_evaluador = examen.medicoEvaluador;
    dto.resultado = examen.resultado;
    dto.restricciones = examen.restricciones;
    dto.observaciones = examen.observaciones;
    dto.resultado_archivo_url = examen.resultadoArchivoUrl;
    dto.estado = examen.estado;
    dto.revisado_por_doctor = examen.revisadoPorDoctor;
    dto.doctor_interno_id = examen.doctorInternoId;
    dto.fecha_revision_doctor = examen.fechaRevisionDoctor
      ? examen.fechaRevisionDoctor.toISOString()
      : null;
    dto.cargado_por =
      examen.cargadoPor?.nombreCompleto || examen.cargadoPor?.dni || null;
    dto.cargado_por_id = examen.cargadoPorId;
    dto.createdAt = examen.createdAt;
    dto.updatedAt = examen.updatedAt;
    return dto;
  }
}
