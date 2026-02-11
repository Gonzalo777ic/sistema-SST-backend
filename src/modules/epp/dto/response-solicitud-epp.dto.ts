import { EstadoSolicitudEPP } from '../entities/solicitud-epp.entity';

export class ResponseSolicitudEppDetalleDto {
  id: string;
  epp_id: string;
  epp_nombre: string;
  epp_imagen_url: string | null;
  cantidad: number;
}

export class ResponseSolicitudEppDto {
  id: string;
  codigo_correlativo: string | null;
  fecha_solicitud: string;
  usuario_epp_id: string;
  usuario_epp_nombre: string | null;
  solicitante_id: string;
  solicitante_nombre: string | null;
  solicitante_documento: string | null;
  motivo: string | null;
  centro_costos: string | null;
  comentarios: string | null;
  observaciones: string | null;
  estado: EstadoSolicitudEPP;
  supervisor_aprobador_id: string | null;
  supervisor_aprobador_nombre: string | null;
  fecha_aprobacion: string | null;
  comentarios_aprobacion: string | null;
  entregado_por_id: string | null;
  entregado_por_nombre: string | null;
  fecha_entrega: string | null;
  firma_recepcion_url: string | null;
  area_id: string | null;
  area_nombre: string | null;
  empresa_id: string;
  empresa_nombre: string | null;
  unidad: string | null;
  sede: string | null;
  detalles: ResponseSolicitudEppDetalleDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(solicitud: any): ResponseSolicitudEppDto {
    const dto = new ResponseSolicitudEppDto();
    dto.id = solicitud.id;
    dto.codigo_correlativo = solicitud.codigoCorrelativo;
    dto.fecha_solicitud = solicitud.fechaSolicitud
      ? new Date(solicitud.fechaSolicitud).toISOString()
      : new Date().toISOString();
    dto.usuario_epp_id = solicitud.usuarioEppId;
    dto.usuario_epp_nombre =
      (solicitud.usuarioEpp as any)?.nombreCompleto ||
      (solicitud.usuarioEpp as any)?.dni ||
      null;
    dto.solicitante_id = solicitud.solicitanteId;
    dto.solicitante_nombre = solicitud.solicitante?.nombreCompleto || null;
    dto.solicitante_documento = solicitud.solicitante?.documentoIdentidad || null;
    dto.motivo = solicitud.motivo;
    dto.centro_costos = solicitud.centroCostos;
    dto.comentarios = solicitud.comentarios;
    dto.observaciones = solicitud.observaciones;
    dto.estado = solicitud.estado;
    dto.supervisor_aprobador_id = solicitud.supervisorAprobadorId;
    dto.supervisor_aprobador_nombre =
      (solicitud.supervisorAprobador as any)?.nombreCompleto ||
      (solicitud.supervisorAprobador as any)?.dni ||
      null;
    dto.fecha_aprobacion = solicitud.fechaAprobacion
      ? new Date(solicitud.fechaAprobacion).toISOString()
      : null;
    dto.comentarios_aprobacion = solicitud.comentariosAprobacion;
    dto.entregado_por_id = solicitud.entregadoPorId;
    dto.entregado_por_nombre =
      (solicitud.entregadoPor as any)?.nombreCompleto ||
      (solicitud.entregadoPor as any)?.dni ||
      null;
    dto.fecha_entrega = solicitud.fechaEntrega
      ? new Date(solicitud.fechaEntrega).toISOString()
      : null;
    dto.firma_recepcion_url = solicitud.firmaRecepcionUrl;
    dto.area_id = solicitud.areaId;
    dto.area_nombre = (solicitud.area as any)?.nombre || null;
    dto.empresa_id = solicitud.empresaId;
    dto.empresa_nombre = (solicitud.empresa as any)?.nombre || null;
    dto.unidad = (solicitud.solicitante as any)?.area?.nombre || null;
    dto.sede = (solicitud.solicitante as any)?.areaTrabajo || null;
    dto.detalles = (solicitud.detalles || []).map((detalle: any) => ({
      id: detalle.id,
      epp_id: detalle.eppId,
      epp_nombre: detalle.epp?.nombre || '',
      epp_imagen_url: detalle.epp?.imagenUrl || null,
      cantidad: detalle.cantidad,
    }));
    dto.createdAt = solicitud.createdAt;
    dto.updatedAt = solicitud.updatedAt;
    return dto;
  }
}
