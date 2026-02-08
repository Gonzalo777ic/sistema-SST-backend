import { DiaSemana } from '../entities/horario-doctor.entity';

export class ResponseHorarioDoctorDto {
  id: string;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  duracion_cita_minutos: number;
  activo: boolean;
  doctor_id: string;
  doctor_nombre: string | null;
  empresa_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(horario: {
    id: string;
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
    duracionCitaMinutos: number;
    activo: boolean;
    doctorId: string;
    empresaId: string;
    doctor?: { nombreCompleto?: string; dni?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseHorarioDoctorDto {
    const dto = new ResponseHorarioDoctorDto();
    dto.id = horario.id;
    dto.dia_semana = horario.diaSemana;
    dto.hora_inicio = horario.horaInicio;
    dto.hora_fin = horario.horaFin;
    dto.duracion_cita_minutos = horario.duracionCitaMinutos;
    dto.activo = horario.activo;
    dto.doctor_id = horario.doctorId;
    dto.doctor_nombre =
      horario.doctor?.nombreCompleto || horario.doctor?.dni || null;
    dto.empresa_id = horario.empresaId;
    dto.createdAt = horario.createdAt;
    dto.updatedAt = horario.updatedAt;
    return dto;
  }
}
