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
  area_id: string | null;
  responsable_investigacion: string | null;
  responsable_investigacion_id: string | null;
  empresa_id: string;
  reportado_por: string | null;
  reportado_por_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(incidente: {
    id: string;
    tipo: TipoIncidente;
    severidad: SeveridadIncidente;
    fechaHora: Date;
    descripcion: string;
    parteCuerpoAfectada: string | null;
    diasPerdidos: number;
    fotos: string[] | null;
    causas: string | null;
    accionesInmediatas: string | null;
    testigos: Array<{ nombre: string; documento?: string; contacto?: string }> | null;
    accionesCorrectivas: string | null;
    estado: EstadoIncidente;
    areaTrabajo: string;
    trabajadorAfectadoId: string | null;
    nombreTrabajadorSnapshot: string | null;
    areaId: string | null;
    responsableInvestigacionId: string | null;
    empresaId: string;
    reportadoPorId: string;
    trabajadorAfectado?: { nombreCompleto: string } | null;
    responsableInvestigacion?: { nombreCompleto?: string; dni?: string } | null;
    reportadoPor?: { nombreCompleto?: string; dni?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseIncidenteDto {
    const dto = new ResponseIncidenteDto();
    dto.id = incidente.id;
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
    dto.area_id = incidente.areaId;
    dto.responsable_investigacion =
      incidente.responsableInvestigacion?.nombreCompleto ||
      incidente.responsableInvestigacion?.dni ||
      null;
    dto.responsable_investigacion_id = incidente.responsableInvestigacionId;
    dto.empresa_id = incidente.empresaId;
    dto.reportado_por =
      incidente.reportadoPor?.nombreCompleto ||
      incidente.reportadoPor?.dni ||
      null;
    dto.reportado_por_id = incidente.reportadoPorId;
    dto.createdAt = incidente.createdAt;
    dto.updatedAt = incidente.updatedAt;
    return dto;
  }
}
