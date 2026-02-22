export class ResponseAntecedenteOcupacionalDto {
  id: string;
  empresa: string;
  area_trabajo: string | null;
  ocupacion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  tiempo_total: string | null;
  riesgos: string | null;
  epp_utilizado: string | null;
  trabajador_id: string;
}
