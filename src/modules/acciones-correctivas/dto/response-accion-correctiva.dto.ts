import { FuenteAccion, EstadoAccion, AccionCorrectiva } from '../entities/accion-correctiva.entity';

export class ResponseAccionCorrectivaDto {
  id: string;
  fuente: FuenteAccion;
  titulo: string;
  descripcion: string | null;
  fecha_programada: string;
  fecha_ejecucion: string | null;
  fecha_aprobacion: string | null;
  estado: EstadoAccion;
  sede: string | null;
  unidad: string | null;
  empresa_id: string;
  empresa_nombre: string | null;
  area_id: string | null;
  area_nombre: string | null;
  elaborado_por_id: string;
  elaborado_por_nombre: string | null;
  responsable_levantamiento_id: string;
  responsable_levantamiento_nombre: string | null;
  contratista_id: string | null;
  contratista_nombre: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(accion: AccionCorrectiva): ResponseAccionCorrectivaDto {
    const dto = new ResponseAccionCorrectivaDto();
    dto.id = accion.id;
    dto.fuente = accion.fuente;
    dto.titulo = accion.titulo;
    dto.descripcion = accion.descripcion;
    dto.fecha_programada = accion.fechaProgramada.toISOString().split('T')[0];
    dto.fecha_ejecucion = accion.fechaEjecucion
      ? accion.fechaEjecucion.toISOString().split('T')[0]
      : null;
    dto.fecha_aprobacion = accion.fechaAprobacion
      ? accion.fechaAprobacion.toISOString().split('T')[0]
      : null;
    dto.estado = accion.estado;
    dto.sede = accion.sede;
    dto.unidad = accion.unidad;
    dto.empresa_id = accion.empresaId;
    dto.empresa_nombre = (accion.empresa as any)?.nombre || null;
    dto.area_id = accion.areaId;
    dto.area_nombre = (accion.area as any)?.nombre || null;
    dto.elaborado_por_id = accion.elaboradoPorId;
    dto.elaborado_por_nombre =
      (accion.elaboradoPor as any)?.nombreCompleto || (accion.elaboradoPor as any)?.dni || null;
    dto.responsable_levantamiento_id = accion.responsableLevantamientoId;
    dto.responsable_levantamiento_nombre =
      (accion.responsableLevantamiento as any)?.nombreCompleto || null;
    dto.contratista_id = accion.contratistaId;
    dto.contratista_nombre = (accion.contratista as any)?.razonSocial || null;
    dto.createdAt = accion.createdAt;
    dto.updatedAt = accion.updatedAt;
    return dto;
  }
}

export class AccionesKPIsDto {
  aprobados: number;
  pendientes: number;
  total: number;
}
