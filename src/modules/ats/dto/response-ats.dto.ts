import { EstadoATS } from '../entities/ats.entity';

export class PersonalInvolucradoResponseDto {
  nombre: string;
  documento: string;
  firma_url: string | null;
}

export class PasoTrabajoResponseDto {
  numero: number;
  paso_tarea: string;
  peligros_riesgos: string;
  medidas_control: string;
  responsable: string | null;
}

export class ResponseAtsDto {
  id: string;
  numero_ats: string;
  fecha: string;
  area: string;
  area_id: string;
  ubicacion: string | null;
  estado: EstadoATS;
  hora_inicio: string | null;
  hora_fin: string | null;
  fecha_aprobacion: string | null;
  trabajo_a_realizar: string;
  herramientas_equipos: string | null;
  condiciones_climaticas: string | null;
  observaciones: string | null;
  epp_requerido: string[] | null;
  trabajo_altura: boolean;
  trabajo_caliente: boolean;
  espacio_confinado: boolean;
  excavacion: boolean;
  energia_electrica: boolean;
  firma_elaborador: string | null;
  firma_supervisor_url: string | null;
  pdf_url: string | null;
  historial_versiones: any[] | null;
  elaborado_por: string | null;
  supervisor: string | null;
  aprobado_por: string | null;
  personal_involucrado: PersonalInvolucradoResponseDto[];
  pasos_trabajo: PasoTrabajoResponseDto[];
  empresa_id: string;
  elaborado_por_id: string;
  supervisor_id: string | null;
  aprobado_por_id: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(ats: {
    id: string;
    numeroAts: string;
    fecha: Date;
    areaId: string;
    area?: { nombre: string } | null;
    ubicacion: string | null;
    estado: EstadoATS;
    horaInicio: string | null;
    horaFin: string | null;
    fechaAprobacion: Date | null;
    trabajoARealizar: string;
    herramientasEquipos: string | null;
    condicionesClimaticas: string | null;
    observaciones: string | null;
    eppRequerido: string[] | null;
    trabajoAltura: boolean;
    trabajoCaliente: boolean;
    espacioConfinado: boolean;
    excavacion: boolean;
    energiaElectrica: boolean;
    firmaElaborador: string | null;
    firmaSupervisorUrl: string | null;
    pdfUrl: string | null;
    historialVersiones: any[] | null;
    empresaId: string;
    elaboradoPorId: string;
    supervisorId: string | null;
    aprobadoPorId: string | null;
    elaboradoPor?: { nombreCompleto?: string; email?: string } | null;
    supervisor?: { nombreCompleto?: string; email?: string } | null;
    aprobadoPor?: { nombreCompleto?: string; email?: string } | null;
    personalInvolucrado?: Array<{
      nombre: string;
      documento: string;
      firmaUrl: string | null;
    }>;
    pasosTrabajo?: Array<{
      numero: number;
      pasoTarea: string;
      peligrosRiesgos: string;
      medidasControl: string;
      responsable: string | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseAtsDto {
    const dto = new ResponseAtsDto();
    dto.id = ats.id;
    dto.numero_ats = ats.numeroAts;
    dto.fecha = ats.fecha instanceof Date
      ? ats.fecha.toISOString().split('T')[0]
      : String(ats.fecha);
    dto.area = ats.area?.nombre || '';
    dto.area_id = ats.areaId;
    dto.ubicacion = ats.ubicacion;
    dto.estado = ats.estado;
    dto.hora_inicio = ats.horaInicio;
    dto.hora_fin = ats.horaFin;
    dto.fecha_aprobacion = ats.fechaAprobacion
      ? ats.fechaAprobacion.toISOString()
      : null;
    dto.trabajo_a_realizar = ats.trabajoARealizar;
    dto.herramientas_equipos = ats.herramientasEquipos;
    dto.condiciones_climaticas = ats.condicionesClimaticas;
    dto.observaciones = ats.observaciones;
    dto.epp_requerido = ats.eppRequerido;
    dto.trabajo_altura = ats.trabajoAltura;
    dto.trabajo_caliente = ats.trabajoCaliente;
    dto.espacio_confinado = ats.espacioConfinado;
    dto.excavacion = ats.excavacion;
    dto.energia_electrica = ats.energiaElectrica;
    dto.firma_elaborador = ats.firmaElaborador;
    dto.firma_supervisor_url = ats.firmaSupervisorUrl;
    dto.pdf_url = ats.pdfUrl;
    dto.historial_versiones = ats.historialVersiones;
    dto.elaborado_por =
      ats.elaboradoPor?.nombreCompleto || ats.elaboradoPor?.email || null;
    dto.supervisor =
      ats.supervisor?.nombreCompleto || ats.supervisor?.email || null;
    dto.aprobado_por =
      ats.aprobadoPor?.nombreCompleto || ats.aprobadoPor?.email || null;
    dto.personal_involucrado =
      ats.personalInvolucrado?.map((p) => ({
        nombre: p.nombre,
        documento: p.documento,
        firma_url: p.firmaUrl,
      })) || [];
    dto.pasos_trabajo =
      ats.pasosTrabajo?.map((p) => ({
        numero: p.numero,
        paso_tarea: p.pasoTarea,
        peligros_riesgos: p.peligrosRiesgos,
        medidas_control: p.medidasControl,
        responsable: p.responsable,
      })) || [];
    dto.empresa_id = ats.empresaId;
    dto.elaborado_por_id = ats.elaboradoPorId;
    dto.supervisor_id = ats.supervisorId;
    dto.aprobado_por_id = ats.aprobadoPorId;
    dto.createdAt = ats.createdAt;
    dto.updatedAt = ats.updatedAt;
    return dto;
  }
}
