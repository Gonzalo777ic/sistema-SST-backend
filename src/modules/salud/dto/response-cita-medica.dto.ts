import { EstadoCita } from '../entities/cita-medica.entity';

export class ResponseCitaMedicaDto {
  id: string;
  motivo: string;
  estado: EstadoCita;
  fecha_cita: string;
  hora_cita: string;
  duracion_minutos: number;
  fecha_confirmacion: string | null;
  notas_cita: string | null;
  doctor_nombre: string | null;
  trabajador_id: string;
  trabajador_nombre: string | null;
  doctor_id: string | null;
  examen_relacionado_id: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(cita: {
    id: string;
    motivo: string;
    estado: EstadoCita;
    fechaCita: Date;
    horaCita: string;
    duracionMinutos: number;
    fechaConfirmacion: Date | null;
    notasCita: string | null;
    doctorNombre: string | null;
    trabajadorId: string;
    doctorId: string | null;
    examenRelacionadoId: string | null;
    trabajador?: { nombreCompleto: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseCitaMedicaDto {
    const dto = new ResponseCitaMedicaDto();
    dto.id = cita.id;
    dto.motivo = cita.motivo;
    dto.estado = cita.estado;
    dto.fecha_cita = cita.fechaCita.toISOString().split('T')[0];
    dto.hora_cita = cita.horaCita;
    dto.duracion_minutos = cita.duracionMinutos;
    dto.fecha_confirmacion = cita.fechaConfirmacion
      ? cita.fechaConfirmacion.toISOString()
      : null;
    dto.notas_cita = cita.notasCita;
    dto.doctor_nombre = cita.doctorNombre;
    dto.trabajador_id = cita.trabajadorId;
    dto.trabajador_nombre = cita.trabajador?.nombreCompleto || null;
    dto.doctor_id = cita.doctorId;
    dto.examen_relacionado_id = cita.examenRelacionadoId;
    dto.createdAt = cita.createdAt;
    dto.updatedAt = cita.updatedAt;
    return dto;
  }
}
