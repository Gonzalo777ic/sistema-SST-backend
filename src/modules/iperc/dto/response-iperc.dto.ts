import { EstadoIPERC } from '../entities/iperc.entity';
import { NivelRiesgo } from '../entities/linea-iperc.entity';

export class LineaIpercResponseDto {
  numero: number;
  actividad: string;
  tarea: string;
  puesto_trabajo: string | null;
  peligro: string;
  riesgo: string;
  requisito_legal: string | null;
  probabilidad_a: number;
  probabilidad_b: number;
  probabilidad_c: number;
  probabilidad_d: number;
  indice_probabilidad: number;
  indice_severidad: number;
  valor_riesgo: number;
  nivel_riesgo: NivelRiesgo;
  jerarquia_eliminacion: boolean;
  jerarquia_sustitucion: boolean;
  jerarquia_controles_ingenieria: boolean;
  jerarquia_controles_admin: boolean;
  jerarquia_epp: boolean;
  medidas_control: string;
  responsable: string | null;
}

export class ResponseIpercDto {
  id: string;
  razon_social: string;
  area: string | null;
  proceso: string;
  fecha_elaboracion: string;
  estado: EstadoIPERC;
  pdf_url: string | null;
  historial_versiones: any[] | null;
  firma_elaborador: string | null;
  elaborado_por: string | null;
  aprobado_por: string | null;
  firma_aprobador: string | null;
  lineas_iperc: LineaIpercResponseDto[];
  empresa_id: string;
  area_id: string | null;
  elaborado_por_id: string;
  aprobado_por_id: string | null;
  createdAt: Date;
  updatedAt: Date;

  static calculateIndiceProbabilidad(
    a: number,
    b: number,
    c: number,
    d: number,
  ): number {
    return a + b + c + d;
  }

  static calculateValorRiesgo(
    indiceProbabilidad: number,
    indiceSeveridad: number,
  ): number {
    return indiceProbabilidad * indiceSeveridad;
  }

  static calculateNivelRiesgo(valorRiesgo: number): NivelRiesgo {
    if (valorRiesgo <= 5) return NivelRiesgo.Trivial;
    if (valorRiesgo <= 10) return NivelRiesgo.Tolerable;
    if (valorRiesgo <= 15) return NivelRiesgo.Moderado;
    if (valorRiesgo <= 20) return NivelRiesgo.Importante;
    return NivelRiesgo.Intolerable;
  }

  static fromEntity(iperc: {
    id: string;
    razonSocial: string;
    areaId: string | null;
    proceso: string;
    fechaElaboracion: Date;
    estado: EstadoIPERC;
    pdfUrl: string | null;
    historialVersiones: any[] | null;
    firmaElaborador: string | null;
    firmaAprobador: string | null;
    empresaId: string;
    elaboradoPorId: string;
    aprobadoPorId: string | null;
    area?: { nombre: string } | null;
    elaboradoPor?: { nombreCompleto?: string; email?: string } | null;
    aprobadoPor?: { nombreCompleto?: string; email?: string } | null;
    lineasIperc?: Array<{
      numero: number;
      actividad: string;
      tarea: string;
      puestoTrabajo: string | null;
      peligro: string;
      riesgo: string;
      requisitoLegal: string | null;
      probabilidadA: number;
      probabilidadB: number;
      probabilidadC: number;
      probabilidadD: number;
      indiceProbabilidad: number;
      indiceSeveridad: number;
      valorRiesgo: number;
      nivelRiesgo: NivelRiesgo;
      jerarquiaEliminacion: boolean;
      jerarquiaSustitucion: boolean;
      jerarquiaControlesIngenieria: boolean;
      jerarquiaControlesAdmin: boolean;
      jerarquiaEpp: boolean;
      medidasControl: string;
      responsable: string | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseIpercDto {
    const dto = new ResponseIpercDto();
    dto.id = iperc.id;
    dto.razon_social = iperc.razonSocial;
    dto.area = iperc.area?.nombre || null;
    dto.proceso = iperc.proceso;
    dto.fecha_elaboracion = iperc.fechaElaboracion instanceof Date
      ? iperc.fechaElaboracion.toISOString().split('T')[0]
      : String(iperc.fechaElaboracion);
    dto.estado = iperc.estado;
    dto.pdf_url = iperc.pdfUrl;
    dto.historial_versiones = iperc.historialVersiones;
    dto.firma_elaborador = iperc.firmaElaborador;
    dto.elaborado_por =
      iperc.elaboradoPor?.nombreCompleto || iperc.elaboradoPor?.email || null;
    dto.aprobado_por =
      iperc.aprobadoPor?.nombreCompleto || iperc.aprobadoPor?.email || null;
    dto.firma_aprobador = iperc.firmaAprobador;
    dto.lineas_iperc =
      iperc.lineasIperc?.map((l) => ({
        numero: l.numero,
        actividad: l.actividad,
        tarea: l.tarea,
        puesto_trabajo: l.puestoTrabajo,
        peligro: l.peligro,
        riesgo: l.riesgo,
        requisito_legal: l.requisitoLegal,
        probabilidad_a: l.probabilidadA,
        probabilidad_b: l.probabilidadB,
        probabilidad_c: l.probabilidadC,
        probabilidad_d: l.probabilidadD,
        indice_probabilidad: l.indiceProbabilidad,
        indice_severidad: l.indiceSeveridad,
        valor_riesgo: l.valorRiesgo,
        nivel_riesgo: l.nivelRiesgo,
        jerarquia_eliminacion: l.jerarquiaEliminacion,
        jerarquia_sustitucion: l.jerarquiaSustitucion,
        jerarquia_controles_ingenieria: l.jerarquiaControlesIngenieria,
        jerarquia_controles_admin: l.jerarquiaControlesAdmin,
        jerarquia_epp: l.jerarquiaEpp,
        medidas_control: l.medidasControl,
        responsable: l.responsable,
      })) || [];
    dto.empresa_id = iperc.empresaId;
    dto.area_id = iperc.areaId;
    dto.elaborado_por_id = iperc.elaboradoPorId;
    dto.aprobado_por_id = iperc.aprobadoPorId;
    dto.createdAt = iperc.createdAt;
    dto.updatedAt = iperc.updatedAt;
    return dto;
  }
}
