import { TipoCapacitacion, EstadoCapacitacion } from '../entities/capacitacion.entity';

export class ParticipanteResponseDto {
  trabajador_id: string;
  nombre: string;
  asistencia: boolean;
  calificacion: number | null;
  aprobado: boolean;
  firmo: boolean;
  rendio_examen?: boolean;
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
  lugar: string | null;
  tipo: TipoCapacitacion;
  fecha: string;
  fecha_fin: string | null;
  sede: string | null;
  unidad: string | null;
  area: string | null;
  grupo: string | null;
  instrucciones: { id: string; descripcion: string; esEvaluacion: boolean; imagenUrl?: string; firmaRegistro?: boolean }[] | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  duracion_horas: number | null;
  duracion_minutos: number | null;
  duracion_hhmm: string | null;
  estado: EstadoCapacitacion;
  instructor: string | null;
  firma_capacitador_url: string | null;
  material_url: string | null;
  certificado_url: string | null;
  participantes: ParticipanteResponseDto[];
  examenes: ExamenResponseDto[];
  empresa_id: string;
  empresa_nombre: string | null;
  creado_por: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(capacitacion: {
    id: string;
    titulo: string;
    descripcion: string;
    lugar?: string | null;
    tipo: TipoCapacitacion;
    fecha: Date;
    fechaFin?: Date | null;
    sede?: string | null;
    unidad?: string | null;
    horaInicio?: string | null;
    horaFin?: string | null;
    duracionHoras?: number | null;
    duracionMinutos?: number | null;
    estado: EstadoCapacitacion;
    instructorNombre: string | null;
    firmaCapacitadorUrl?: string | null;
    materialUrl: string | null;
    certificadoUrl: string | null;
    empresaId: string;
    empresa?: { nombre: string } | null;
    creadoPorId: string;
    asistencias?: Array<{
      trabajadorId: string;
      nombreSnapshot: string;
      asistencia: boolean;
      calificacion: number | null;
      aprobado: boolean;
      firmo?: boolean;
    }>;
    examenes?: Array<{
      id: string;
      titulo: string;
      duracionMinutos: number;
      puntajeMinimoAprobacion: number;
      activo: boolean;
      preguntas: any[];
    }>;
    creadoPor?: { nombres?: string | null; apellidoPaterno?: string | null; apellidoMaterno?: string | null; dni?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseCapacitacionDto {
    const dto = new ResponseCapacitacionDto();
    dto.id = capacitacion.id;
    dto.titulo = capacitacion.titulo;
    dto.descripcion = capacitacion.descripcion;
    dto.lugar = capacitacion.lugar ?? null;
    dto.tipo = capacitacion.tipo;

    const fechaDate = capacitacion.fecha instanceof Date
      ? capacitacion.fecha
      : new Date(capacitacion.fecha);
    dto.fecha = !isNaN(fechaDate.getTime())
      ? fechaDate.toISOString().split('T')[0]
      : 'Fecha inválida';

    dto.fecha_fin = capacitacion.fechaFin
      ? (capacitacion.fechaFin instanceof Date
          ? capacitacion.fechaFin
          : new Date(capacitacion.fechaFin)
        ).toISOString().split('T')[0]
      : null;
    dto.sede = capacitacion.sede ?? null;
    dto.unidad = capacitacion.unidad ?? null;
    dto.area = (capacitacion as any).area ?? null;
    dto.grupo = (capacitacion as any).grupo ?? null;
    dto.instrucciones = (capacitacion as any).instrucciones ?? null;
    dto.hora_inicio = capacitacion.horaInicio ?? null;
    dto.hora_fin = capacitacion.horaFin ?? null;
    dto.duracion_horas = capacitacion.duracionHoras != null ? Number(capacitacion.duracionHoras) : null;
    dto.duracion_minutos = capacitacion.duracionMinutos ?? null;
    dto.duracion_hhmm =
      capacitacion.duracionMinutos != null
        ? `${Math.floor(capacitacion.duracionMinutos / 60)}:${String(capacitacion.duracionMinutos % 60).padStart(2, '0')}`
        : null;
    dto.estado = capacitacion.estado;
    dto.instructor = capacitacion.instructorNombre;
    dto.firma_capacitador_url = capacitacion.firmaCapacitadorUrl ?? null;
    dto.empresa_nombre = (capacitacion.empresa as any)?.nombre ?? null;
    dto.material_url = capacitacion.materialUrl;
    dto.certificado_url = capacitacion.certificadoUrl;
    dto.participantes =
      capacitacion.asistencias?.map((a) => ({
        trabajador_id: a.trabajadorId,
        nombre: a.nombreSnapshot,
        asistencia: a.asistencia,
        calificacion: a.calificacion,
        aprobado: a.aprobado,
        firmo: (a as any).firmo ?? false,
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
    const cp = capacitacion.creadoPor as any;
    dto.creado_por =
      (cp?.nombres && [cp.nombres, cp.apellidoPaterno, cp.apellidoMaterno].filter(Boolean).join(' ')) ||
      cp?.dni ||
      null;
    dto.createdAt = capacitacion.createdAt;
    dto.updatedAt = capacitacion.updatedAt;
    return dto;
  }
}
