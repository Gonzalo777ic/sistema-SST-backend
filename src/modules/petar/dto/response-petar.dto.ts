import { TipoTrabajoPETAR, EstadoPETAR } from '../entities/petar.entity';

export class TrabajadorPetarResponseDto {
  nombre: string;
  documento: string;
  email: string | null;
  firma_url: string | null;
  fecha_firma: string | null;
  confirmado: boolean;
}

export class PeligroPetarResponseDto {
  peligro: string;
  riesgo: string;
  nivel_inicial: string;
  medida_control: string;
  nivel_residual: string;
}

export class CondicionPreviaResponseDto {
  condicion: string;
  verificado: boolean;
}

export class ChecklistVerificacionResponseDto {
  item: string;
  cumple: boolean;
  observacion: string;
}

export class ResponsePetarDto {
  id: string;
  codigo: string;
  tipo_trabajo: TipoTrabajoPETAR;
  descripcion_tarea: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoPETAR;
  equipos_herramientas: string | null;
  epp_requerido: string[] | null;
  condiciones_previas: CondicionPreviaResponseDto[] | null;
  checklist_verificacion: ChecklistVerificacionResponseDto[] | null;
  peligros: PeligroPetarResponseDto[] | null;
  observaciones: string | null;
  supervisor_responsable: string | null;
  firma_supervisor_url: string | null;
  fecha_firma_supervisor: string | null;
  aprobador_sst: string | null;
  firma_sst_url: string | null;
  fecha_firma_sst: string | null;
  empresa_contratista: string | null;
  trabajadores: TrabajadorPetarResponseDto[];
  empresa_id: string;
  supervisor_responsable_id: string;
  aprobador_sst_id: string | null;
  empresa_contratista_id: string | null;
  creado_por_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(petar: {
    id: string;
    codigo: string;
    tipoTrabajo: TipoTrabajoPETAR;
    descripcionTarea: string;
    area: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoPETAR;
    equiposHerramientas: string | null;
    eppRequerido: string[] | null;
    condicionesPrevias: Array<{ condicion: string; verificado: boolean }> | null;
    checklistVerificacion: Array<{
      item: string;
      cumple: boolean;
      observacion: string;
    }> | null;
    peligros: Array<{
      peligro: string;
      riesgo: string;
      nivel_inicial: string;
      medida_control: string;
      nivel_residual: string;
    }> | null;
    observaciones: string | null;
    supervisorResponsableId: string;
    firmaSupervisorUrl: string | null;
    fechaFirmaSupervisor: Date | null;
    aprobadorSstId: string | null;
    firmaSstUrl: string | null;
    fechaFirmaSst: Date | null;
    empresaContratistaId: string | null;
    empresaId: string;
    creadoPorId: string;
    supervisorResponsable?: { nombreCompleto?: string; email?: string } | null;
    aprobadorSst?: { nombreCompleto?: string; email?: string } | null;
    trabajadores?: Array<{
      nombreSnapshot: string;
      documentoSnapshot: string;
      emailSnapshot: string | null;
      firmaUrl: string | null;
      fechaFirma: Date | null;
      confirmado: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponsePetarDto {
    const dto = new ResponsePetarDto();
    dto.id = petar.id;
    dto.codigo = petar.codigo;
    dto.tipo_trabajo = petar.tipoTrabajo;
    dto.descripcion_tarea = petar.descripcionTarea;
    dto.area = petar.area;
    dto.fecha_inicio = petar.fechaInicio.toISOString();
    dto.fecha_fin = petar.fechaFin.toISOString();
    dto.estado = petar.estado;
    dto.equipos_herramientas = petar.equiposHerramientas;
    dto.epp_requerido = petar.eppRequerido;
    dto.condiciones_previas = petar.condicionesPrevias;
    dto.checklist_verificacion = petar.checklistVerificacion;
    dto.peligros = petar.peligros;
    dto.observaciones = petar.observaciones;
    dto.supervisor_responsable =
      petar.supervisorResponsable?.nombreCompleto ||
      petar.supervisorResponsable?.email ||
      null;
    dto.firma_supervisor_url = petar.firmaSupervisorUrl;
    dto.fecha_firma_supervisor = petar.fechaFirmaSupervisor
      ? petar.fechaFirmaSupervisor.toISOString()
      : null;
    dto.aprobador_sst =
      petar.aprobadorSst?.nombreCompleto || petar.aprobadorSst?.email || null;
    dto.firma_sst_url = petar.firmaSstUrl;
    dto.fecha_firma_sst = petar.fechaFirmaSst
      ? petar.fechaFirmaSst.toISOString()
      : null;
    dto.empresa_contratista = petar.empresaContratistaId;
    dto.trabajadores =
      petar.trabajadores?.map((t) => ({
        nombre: t.nombreSnapshot,
        documento: t.documentoSnapshot,
        email: t.emailSnapshot,
        firma_url: t.firmaUrl,
        fecha_firma: t.fechaFirma ? t.fechaFirma.toISOString() : null,
        confirmado: t.confirmado,
      })) || [];
    dto.empresa_id = petar.empresaId;
    dto.supervisor_responsable_id = petar.supervisorResponsableId;
    dto.aprobador_sst_id = petar.aprobadorSstId;
    dto.empresa_contratista_id = petar.empresaContratistaId;
    dto.creado_por_id = petar.creadoPorId;
    dto.createdAt = petar.createdAt;
    dto.updatedAt = petar.updatedAt;
    return dto;
  }
}
