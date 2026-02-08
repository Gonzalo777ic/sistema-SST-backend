import { TipoEPP, MotivoEPP, EstadoSolicitudEPP } from '../entities/solicitud-epp.entity';

export class ResponseSolicitudEppDto {
  id: string;
  fecha_solicitud: string;
  tipo_epp: TipoEPP;
  cantidad: number;
  talla: string;
  motivo: MotivoEPP;
  descripcion_motivo: string | null;
  estado: EstadoSolicitudEPP;
  supervisor_aprobador: string | null;
  supervisor_aprobador_id: string | null;
  fecha_aprobacion: string | null;
  comentarios_aprobacion: string | null;
  entregado_por: string | null;
  entregado_por_id: string | null;
  fecha_entrega: string | null;
  firma_recepcion_url: string | null;
  trabajador_id: string;
  trabajador_nombre: string | null;
  area_id: string | null;
  empresa_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(solicitud: {
    id: string;
    fechaSolicitud: Date;
    tipoEpp: TipoEPP;
    cantidad: number;
    talla: string;
    motivo: MotivoEPP;
    descripcionMotivo: string | null;
    estado: EstadoSolicitudEPP;
    supervisorAprobadorId: string | null;
    fechaAprobacion: Date | null;
    comentariosAprobacion: string | null;
    entregadoPorId: string | null;
    fechaEntrega: Date | null;
    firmaRecepcionUrl: string | null;
    trabajadorId: string;
    areaId: string | null;
    empresaId: string;
    trabajador?: { nombreCompleto: string } | null;
    supervisorAprobador?: { nombreCompleto?: string; email?: string } | null;
    entregadoPor?: { nombreCompleto?: string; email?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseSolicitudEppDto {
    const dto = new ResponseSolicitudEppDto();
    dto.id = solicitud.id;
    dto.fecha_solicitud = solicitud.fechaSolicitud.toISOString();
    dto.tipo_epp = solicitud.tipoEpp;
    dto.cantidad = solicitud.cantidad;
    dto.talla = solicitud.talla;
    dto.motivo = solicitud.motivo;
    dto.descripcion_motivo = solicitud.descripcionMotivo;
    dto.estado = solicitud.estado;
    dto.supervisor_aprobador =
      solicitud.supervisorAprobador?.nombreCompleto ||
      solicitud.supervisorAprobador?.email ||
      null;
    dto.supervisor_aprobador_id = solicitud.supervisorAprobadorId;
    dto.fecha_aprobacion = solicitud.fechaAprobacion
      ? solicitud.fechaAprobacion.toISOString()
      : null;
    dto.comentarios_aprobacion = solicitud.comentariosAprobacion;
    dto.entregado_por =
      solicitud.entregadoPor?.nombreCompleto ||
      solicitud.entregadoPor?.email ||
      null;
    dto.entregado_por_id = solicitud.entregadoPorId;
    dto.fecha_entrega = solicitud.fechaEntrega
      ? solicitud.fechaEntrega.toISOString()
      : null;
    dto.firma_recepcion_url = solicitud.firmaRecepcionUrl;
    dto.trabajador_id = solicitud.trabajadorId;
    dto.trabajador_nombre = solicitud.trabajador?.nombreCompleto || null;
    dto.area_id = solicitud.areaId;
    dto.empresa_id = solicitud.empresaId;
    dto.createdAt = solicitud.createdAt;
    dto.updatedAt = solicitud.updatedAt;
    return dto;
  }
}
