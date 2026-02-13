import { EstadoSolicitudEPP } from '../entities/solicitud-epp.entity';

export class ResponseSolicitudEppDetalleDto {
  id: string;
  epp_id: string;
  epp_nombre: string;
  epp_tipo_proteccion: string;
  epp_descripcion: string | null;
  epp_vigencia: string | null;
  epp_categoria_criticidad: string | null;
  epp_imagen_url: string | null;
  cantidad: number;
  exceptuado: boolean;
  exceptuado_por_id: string | null;
  exceptuado_por_nombre: string | null;
  agregado: boolean;
  agregado_por_id: string | null;
  agregado_por_nombre: string | null;
}

export class ResponseSolicitudEppDto {
  id: string;
  codigo_correlativo: string | null;
  fecha_solicitud: string;
  usuario_epp_id: string;
  usuario_epp_nombre: string | null;
  es_auto_solicitud?: boolean; // true si el trabajador creó la solicitud desde su cuenta
  solicitante_id: string;
  solicitante_nombre: string | null;
  solicitante_documento: string | null;
  solicitante_sexo: string | null;
  solicitante_puesto: string | null;
  solicitante_centro_costos: string | null;
  solicitante_jefe_directo: string | null;
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
  kardex_pdf_url: string | null;
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
    const usuarioEpp = solicitud.usuarioEpp as any;
    dto.usuario_epp_nombre =
      usuarioEpp?.trabajador?.nombreCompleto ||
      usuarioEpp?.nombreCompleto ||
      usuarioEpp?.dni ||
      null;
    dto.es_auto_solicitud =
      usuarioEpp?.trabajador?.id != null &&
      solicitud.solicitanteId != null &&
      usuarioEpp.trabajador.id === solicitud.solicitanteId;
    dto.solicitante_id = solicitud.solicitanteId;
    dto.solicitante_nombre = solicitud.solicitante?.nombreCompleto || null;
    dto.solicitante_documento = solicitud.solicitante?.documentoIdentidad || null;
    dto.solicitante_sexo = solicitud.solicitante?.sexo || null;
    dto.solicitante_puesto = (solicitud.solicitante as any)?.cargo || null;
    dto.solicitante_centro_costos = (solicitud.solicitante as any)?.centroCostos || null;
    dto.solicitante_jefe_directo = (solicitud.solicitante as any)?.jefeDirecto || null;
    dto.motivo = solicitud.motivo;
    dto.centro_costos = solicitud.centroCostos;
    dto.comentarios = solicitud.comentarios;
    dto.observaciones = solicitud.observaciones;
    dto.estado = solicitud.estado;
    dto.supervisor_aprobador_id = solicitud.supervisorAprobadorId;
    const sup = solicitud.supervisorAprobador as any;
    dto.supervisor_aprobador_nombre =
      sup?.trabajador?.nombreCompleto || sup?.nombreCompleto || sup?.dni || null;
    dto.fecha_aprobacion = solicitud.fechaAprobacion
      ? new Date(solicitud.fechaAprobacion).toISOString()
      : null;
    dto.comentarios_aprobacion = solicitud.comentariosAprobacion;
    dto.entregado_por_id = solicitud.entregadoPorId;
    const ent = solicitud.entregadoPor as any;
    dto.entregado_por_nombre =
      ent?.trabajador?.nombreCompleto || ent?.nombreCompleto || ent?.dni || null;
    dto.fecha_entrega = solicitud.fechaEntrega
      ? new Date(solicitud.fechaEntrega).toISOString()
      : null;
    dto.firma_recepcion_url = solicitud.firmaRecepcionUrl;
    dto.kardex_pdf_url = solicitud.kardexPdfUrl || null;
    dto.area_id = (solicitud.solicitante as any)?.areaId ?? solicitud.areaId;
    dto.area_nombre = (solicitud.solicitante as any)?.area?.nombre || (solicitud.area as any)?.nombre || null;
    dto.empresa_id = solicitud.empresaId;
    dto.empresa_nombre = (solicitud.empresa as any)?.nombre || null;
    dto.unidad = (solicitud.solicitante as any)?.unidad || null;
    dto.sede = (solicitud.solicitante as any)?.sede || null;
    dto.detalles = (solicitud.detalles || []).map((detalle: any) => {
      const excPor = detalle.exceptuadoPor as any;
      const agrPor = detalle.agregadoPor as any;
      return {
        id: detalle.id,
        epp_id: detalle.eppId,
        epp_nombre: detalle.epp?.nombre || '',
        epp_tipo_proteccion: detalle.epp?.tipoProteccion || '',
        epp_descripcion: detalle.epp?.descripcion || null,
        epp_vigencia: detalle.epp?.vigencia || null,
        epp_categoria_criticidad: detalle.epp?.categoriaCriticidad || null,
        epp_imagen_url: detalle.epp?.imagenUrl || null,
        cantidad: detalle.cantidad,
        exceptuado: detalle.exceptuado ?? false,
        exceptuado_por_id: detalle.exceptuadoPorId || null,
        exceptuado_por_nombre:
          excPor?.trabajador?.nombreCompleto || excPor?.nombreCompleto || excPor?.dni || null,
        agregado: detalle.agregado ?? false,
        agregado_por_id: detalle.agregadoPorId || null,
        agregado_por_nombre:
          agrPor?.trabajador?.nombreCompleto || agrPor?.nombreCompleto || agrPor?.dni || null,
      };
    });
    dto.createdAt = solicitud.createdAt;
    dto.updatedAt = solicitud.updatedAt;
    return dto;
  }
}
