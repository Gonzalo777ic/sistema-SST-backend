import { TipoCapacitacion, EstadoCapacitacion } from '../entities/capacitacion.entity';

export class ParticipanteResponseDto {
  trabajador_id: string;
  nombre: string;
  asistencia: boolean;
  calificacion: number | null;
  aprobado: boolean;
}

export class ResponseCapacitacionDto {
  id: string;
  titulo: string;
  descripcion: string;
  lugar: string;
  tipo: TipoCapacitacion;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_horas: number;
  estado: EstadoCapacitacion;
  instructor: string | null;
  material_url: string | null;
  certificado_url: string | null;
  participantes: ParticipanteResponseDto[];
  empresa_id: string;
  creado_por: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(capacitacion: {
    id: string;
    titulo: string;
    descripcion: string;
    lugar: string;
    tipo: TipoCapacitacion;
    fecha: Date;
    horaInicio: string;
    horaFin: string;
    duracionHoras: number;
    estado: EstadoCapacitacion;
    instructorNombre: string | null;
    materialUrl: string | null;
    certificadoUrl: string | null;
    empresaId: string;
    creadoPorId: string;
    asistencias?: Array<{
      trabajadorId: string;
      nombreSnapshot: string;
      asistencia: boolean;
      calificacion: number | null;
      aprobado: boolean;
    }>;
    creadoPor?: { nombreCompleto?: string; email?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseCapacitacionDto {
    const dto = new ResponseCapacitacionDto();
    dto.id = capacitacion.id;
    dto.titulo = capacitacion.titulo;
    dto.descripcion = capacitacion.descripcion;
    dto.lugar = capacitacion.lugar;
    dto.tipo = capacitacion.tipo;
    dto.fecha = capacitacion.fecha.toISOString().split('T')[0];
    dto.hora_inicio = capacitacion.horaInicio;
    dto.hora_fin = capacitacion.horaFin;
    dto.duracion_horas = Number(capacitacion.duracionHoras);
    dto.estado = capacitacion.estado;
    dto.instructor = capacitacion.instructorNombre;
    dto.material_url = capacitacion.materialUrl;
    dto.certificado_url = capacitacion.certificadoUrl;
    dto.participantes =
      capacitacion.asistencias?.map((a) => ({
        trabajador_id: a.trabajadorId,
        nombre: a.nombreSnapshot,
        asistencia: a.asistencia,
        calificacion: a.calificacion,
        aprobado: a.aprobado,
      })) || [];
    dto.empresa_id = capacitacion.empresaId;
    dto.creado_por =
      capacitacion.creadoPor?.nombreCompleto ||
      capacitacion.creadoPor?.email ||
      null;
    dto.createdAt = capacitacion.createdAt;
    dto.updatedAt = capacitacion.updatedAt;
    return dto;
  }
}
