export enum EstadoVigenciaKardex {
  Vigente = 'Vigente',
  Vencido = 'Vencido',
  VencimientoMenor = 'Vencimiento menor',
  SinRegistro = 'Sin registro',
}

export class ResponseKardexListItemDto {
  trabajador_id: string;
  trabajador_nombre: string;
  razon_social: string | null;
  unidad: string | null;
  area: string | null;
  sede: string | null;
  fecha_entrega: string | null;
  estado: EstadoVigenciaKardex;
  categoria_filtro: string | null; // Para filtro por categoría EPP
}
