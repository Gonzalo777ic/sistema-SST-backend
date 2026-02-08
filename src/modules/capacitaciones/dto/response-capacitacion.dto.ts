import { TipoCapacitacion, EstadoCapacitacion } from '../entities/capacitacion.entity';

export class ParticipanteResponseDto {
  trabajador_id: string;
  nombre: string;
  asistencia: boolean;
  calificacion: number | null;
  aprobado: boolean;
}

export class ExamenResponseDto {
  id: string;
  titulo: string;
  duracion_minutos: number;
  puntaje_minimo_aprobacion: number;
  activo: boolean;
  preguntas_count: number;
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
  examenes: ExamenResponseDto[];
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
    examenes?: Array<{
      id: string;
      titulo: string;
      duracionMinutos: number;
      puntajeMinimoAprobacion: number;
      activo: boolean;
      preguntas: any[];
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


    const fechaDate = capacitacion.fecha instanceof Date 
    ? capacitacion.fecha 
    : new Date(capacitacion.fecha);

  dto.fecha = !isNaN(fechaDate.getTime()) 
    ? fechaDate.toISOString().split('T')[0] 
    : 'Fecha inválida';



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
    dto.examenes =
      capacitacion.examenes?.map((e) => ({
        id: e.id,
        titulo: e.titulo,
        duracion_minutos: e.duracionMinutos,
        puntaje_minimo_aprobacion: e.puntajeMinimoAprobacion,
        activo: e.activo,
        preguntas_count: e.preguntas?.length || 0,
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
