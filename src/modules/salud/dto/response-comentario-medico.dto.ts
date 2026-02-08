export class ResponseComentarioMedicoDto {
  id: string;
  examen_id: string;
  trabajador_id: string;
  doctor_id: string;
  doctor_nombre: string;
  comentario: string;
  recomendaciones: string | null;
  fecha_comentario: string;
  es_confidencial: boolean;
  leido_por_paciente: boolean;
  fecha_lectura: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(comentario: {
    id: string;
    examenId: string;
    trabajadorId: string;
    doctorId: string;
    doctorNombre: string;
    comentario: string;
    recomendaciones: string | null;
    fechaComentario: Date;
    esConfidencial: boolean;
    leidoPorPaciente: boolean;
    fechaLectura: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseComentarioMedicoDto {
    const dto = new ResponseComentarioMedicoDto();
    dto.id = comentario.id;
    dto.examen_id = comentario.examenId;
    dto.trabajador_id = comentario.trabajadorId;
    dto.doctor_id = comentario.doctorId;
    dto.doctor_nombre = comentario.doctorNombre;
    dto.comentario = comentario.comentario;
    dto.recomendaciones = comentario.recomendaciones;
    dto.fecha_comentario = comentario.fechaComentario.toISOString();
    dto.es_confidencial = comentario.esConfidencial;
    dto.leido_por_paciente = comentario.leidoPorPaciente;
    dto.fecha_lectura = comentario.fechaLectura
      ? comentario.fechaLectura.toISOString()
      : null;
    dto.createdAt = comentario.createdAt;
    dto.updatedAt = comentario.updatedAt;
    return dto;
  }
}
