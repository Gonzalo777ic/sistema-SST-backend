/** Respuesta para reporte de estados EPP (vencido, vigente, por vencer) */
export class ReporteEstadosEppDto {
  vencido: number;
  vigente: number;
  por_vencer: number;
  total: number;
}

/** Respuesta para entregas por empresa */
export class ReporteEntregasPorEmpresaDto {
  empresa_id: string;
  empresa_nombre: string;
  total: number;
  vencido: number;
  vigente: number;
  por_vencer: number;
}

/** Respuesta para entregas por empresa y área */
export class ReporteEntregasPorEmpresaAreaDto {
  empresa_id: string;
  empresa_nombre: string;
  area_id: string | null;
  area_nombre: string | null;
  total: number;
  vencido: number;
  vigente: number;
  por_vencer: number;
}

/** Fila de tabla entregas por mes */
export class ReporteEntregasPorMesDto {
  fecha_entrega: string;
  trabajador_id: string;
  trabajador_nombre: string;
  nro_documento: string;
  fecha_vencimiento: string | null;
  razon_social: string;
  sede: string | null;
  equipo: string;
  vigencia: 'Vencido' | 'Vigente' | 'Por vencer';
  cantidad: number;
  costo_unitario: number | null;
}

/** Respuesta para entregas por sede */
export class ReporteEntregasPorSedeDto {
  sede: string;
  total: number;
  vencido: number;
  vigente: number;
  por_vencer: number;
}

/** Respuesta para EPPs más solicitados */
export class ReporteEppsMasSolicitadosDto {
  epp_id: string;
  epp_nombre: string;
  total_solicitado: number;
  cantidad_entregas: number;
}

/** Respuesta para trabajador y costo histórico */
export class ReporteTrabajadorCostoDto {
  trabajador_id: string;
  trabajador_nombre: string;
  nro_documento: string;
  razon_social: string | null;
  total_items: number;
  costo_total: number;
}
