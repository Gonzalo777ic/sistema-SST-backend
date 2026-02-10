import {
  TipoIncidente,
  SeveridadIncidente,
  EstadoIncidente,
} from '../entities/incidente.entity';

export class TestigoResponseDto {
  nombre: string;
  documento?: string;
  contacto?: string;
}

export class ResponseIncidenteDto {
  id: string;
  codigo_correlativo: string | null;
  tipo: TipoIncidente;
  severidad: SeveridadIncidente;
  fecha_hora: string;
  descripcion: string;
  parte_cuerpo_afectada: string | null;
  dias_perdidos: number;
  fotos: string[] | null;
  causas: string | null;
  acciones_inmediatas: string | null;
  testigos: TestigoResponseDto[] | null;
  acciones_correctivas: string | null;
  estado: EstadoIncidente;
  area_trabajo: string;
  trabajador_afectado: string | null;
  trabajador_afectado_id: string | null;
  trabajador_afectado_dni: string | null;
  area_id: string | null;
  area_nombre: string | null;
  responsable_investigacion: string | null;
  responsable_investigacion_id: string | null;
  empresa_id: string;
  empresa_nombre: string | null;
  reportado_por: string | null;
  reportado_por_id: string;
  reportado_por_dni: string | null;
  sede: string | null;
  unidad: string | null;
  total_medidas: number;
  medidas_aprobadas: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(incidente: any): ResponseIncidenteDto {
    const dto = new ResponseIncidenteDto();
    dto.id = incidente.id;
    dto.codigo_correlativo = incidente.codigoCorrelativo || null;
    dto.tipo = incidente.tipo;
    dto.severidad = incidente.severidad;
    dto.fecha_hora = incidente.fechaHora.toISOString();
    dto.descripcion = incidente.descripcion;
    dto.parte_cuerpo_afectada = incidente.parteCuerpoAfectada;
    dto.dias_perdidos = incidente.diasPerdidos;
    dto.fotos = incidente.fotos;
    dto.causas = incidente.causas;
    dto.acciones_inmediatas = incidente.accionesInmediatas;
    dto.testigos = incidente.testigos;
    dto.acciones_correctivas = incidente.accionesCorrectivas;
    dto.estado = incidente.estado;
    dto.area_trabajo = incidente.areaTrabajo;
    dto.trabajador_afectado =
      incidente.trabajadorAfectado?.nombreCompleto ||
      incidente.nombreTrabajadorSnapshot ||
      null;
    dto.trabajador_afectado_id = incidente.trabajadorAfectadoId;
    dto.trabajador_afectado_dni = incidente.trabajadorAfectado?.documentoIdentidad || null;
    dto.area_id = incidente.areaId;
    dto.area_nombre = (incidente.area as any)?.nombre || null;
    dto.responsable_investigacion =
      incidente.responsableInvestigacion?.nombreCompleto ||
      incidente.responsableInvestigacion?.dni ||
      null;
    dto.responsable_investigacion_id = incidente.responsableInvestigacionId;
    dto.empresa_id = incidente.empresaId;
    dto.empresa_nombre = (incidente.empresa as any)?.nombre || null;
    dto.reportado_por =
      incidente.reportadoPor?.nombreCompleto ||
      incidente.reportadoPor?.dni ||
      null;
    dto.reportado_por_id = incidente.reportadoPorId;
    dto.reportado_por_dni = incidente.reportadoPor?.dni || null;
    dto.sede = (incidente.area as any)?.sede || null; // Placeholder, ajustar según estructura real
    dto.unidad = null; // Placeholder, ajustar según estructura real
    dto.total_medidas = incidente.totalMedidas || 0;
    dto.medidas_aprobadas = incidente.medidasAprobadas || 0;
    dto.createdAt = incidente.createdAt;
    dto.updatedAt = incidente.updatedAt;
    return dto;
  }
}
