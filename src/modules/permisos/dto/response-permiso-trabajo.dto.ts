import { TipoPermiso, EstadoPermiso } from '../entities/permiso-trabajo.entity';

export class TrabajadorPermisoResponseDto {
  trabajador_id: string;
  nombre: string;
  documento: string;
  rol: string | null;
  confirmado_lectura: boolean;
  fecha_confirmacion: string | null;
  firma_url: string | null;
}

export class PeligroIdentificadoResponseDto {
  peligro: string;
  riesgo: string;
  medida_control: string;
}

export class ResponsePermisoTrabajoDto {
  id: string;
  numero_permiso: string;
  tipo_permiso: TipoPermiso;
  estado: EstadoPermiso;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion_especifica: string;
  descripcion_trabajo: string;
  epp_requerido: string[] | null;
  herramientas_equipos: string | null;
  peligros_identificados: PeligroIdentificadoResponseDto[] | null;
  fotos_evidencia: string[] | null;
  supervisor_responsable_id: string;
  supervisor_responsable_nombre: string | null;
  firma_supervisor_url: string | null;
  fecha_firma_supervisor: string | null;
  aprobador_sst_id: string | null;
  aprobador_sst_nombre: string | null;
  firma_aprobador_url: string | null;
  fecha_aprobacion: string | null;
  empresa_id: string;
  area_trabajo_id: string | null;
  area_trabajo_nombre: string | null;
  creado_por_id: string;
  trabajadores: TrabajadorPermisoResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(permiso: {
    id: string;
    numeroPermiso: string;
    tipoPermiso: TipoPermiso;
    estado: EstadoPermiso;
    fechaInicio: Date;
    fechaFin: Date;
    ubicacionEspecifica: string;
    descripcionTrabajo: string;
    eppRequerido: string[] | null;
    herramientasEquipos: string | null;
    peligrosIdentificados: Array<{
      peligro: string;
      riesgo: string;
      medida_control: string;
    }> | null;
    fotosEvidencia: string[] | null;
    supervisorResponsableId: string;
    firmaSupervisorUrl: string | null;
    fechaFirmaSupervisor: Date | null;
    aprobadorSstId: string | null;
    firmaAprobadorUrl: string | null;
    fechaAprobacion: Date | null;
    empresaId: string;
    areaTrabajoId: string | null;
    creadoPorId: string;
    supervisorResponsable?: { nombreCompleto?: string; email?: string } | null;
    aprobadorSst?: { nombreCompleto?: string; email?: string } | null;
    areaTrabajo?: { nombre: string } | null;
    trabajadores?: Array<{
      trabajadorId: string;
      nombreTrabajador: string;
      documentoTrabajador: string;
      rol: string | null;
      confirmadoLectura: boolean;
      fechaConfirmacion: Date | null;
      firmaUrl: string | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponsePermisoTrabajoDto {
    const dto = new ResponsePermisoTrabajoDto();
    dto.id = permiso.id;
    dto.numero_permiso = permiso.numeroPermiso;
    dto.tipo_permiso = permiso.tipoPermiso;
    dto.estado = permiso.estado;
    dto.fecha_inicio = permiso.fechaInicio.toISOString();
    dto.fecha_fin = permiso.fechaFin.toISOString();
    dto.ubicacion_especifica = permiso.ubicacionEspecifica;
    dto.descripcion_trabajo = permiso.descripcionTrabajo;
    dto.epp_requerido = permiso.eppRequerido;
    dto.herramientas_equipos = permiso.herramientasEquipos;
    dto.peligros_identificados = permiso.peligrosIdentificados;
    dto.fotos_evidencia = permiso.fotosEvidencia;
    dto.supervisor_responsable_id = permiso.supervisorResponsableId;
    dto.supervisor_responsable_nombre =
      permiso.supervisorResponsable?.nombreCompleto ||
      permiso.supervisorResponsable?.email ||
      null;
    dto.firma_supervisor_url = permiso.firmaSupervisorUrl;
    dto.fecha_firma_supervisor = permiso.fechaFirmaSupervisor
      ? permiso.fechaFirmaSupervisor.toISOString()
      : null;
    dto.aprobador_sst_id = permiso.aprobadorSstId;
    dto.aprobador_sst_nombre =
      permiso.aprobadorSst?.nombreCompleto || permiso.aprobadorSst?.email || null;
    dto.firma_aprobador_url = permiso.firmaAprobadorUrl;
    dto.fecha_aprobacion = permiso.fechaAprobacion
      ? permiso.fechaAprobacion.toISOString()
      : null;
    dto.empresa_id = permiso.empresaId;
    dto.area_trabajo_id = permiso.areaTrabajoId;
    dto.area_trabajo_nombre = permiso.areaTrabajo?.nombre || null;
    dto.creado_por_id = permiso.creadoPorId;
    dto.trabajadores =
      permiso.trabajadores?.map((t) => ({
        trabajador_id: t.trabajadorId,
        nombre: t.nombreTrabajador,
        documento: t.documentoTrabajador,
        rol: t.rol,
        confirmado_lectura: t.confirmadoLectura,
        fecha_confirmacion: t.fechaConfirmacion
          ? t.fechaConfirmacion.toISOString()
          : null,
        firma_url: t.firmaUrl,
      })) || [];
    dto.createdAt = permiso.createdAt;
    dto.updatedAt = permiso.updatedAt;
    return dto;
  }
}
