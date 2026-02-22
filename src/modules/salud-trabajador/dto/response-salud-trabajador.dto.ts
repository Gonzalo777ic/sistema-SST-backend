export class ResponseSaludTrabajadorDto {
  id: string;
  trabajador_id: string;
  alergias: boolean;
  diabetes: boolean;
  tbc: boolean;
  hepatitis_b: boolean;
  asma: boolean;
  hta: boolean;
  its: boolean;
  tifoidea: boolean;
  bronquitis: boolean;
  neoplasia: boolean;
  convulsiones: boolean;
  quemaduras: boolean;
  cirugias: boolean;
  intoxicaciones: boolean;
  otros: boolean;
  detalle_cirugias: string | null;
  detalle_otros: string | null;
  antecedente_padre: string | null;
  antecedente_madre: string | null;
  antecedente_hermanos: string | null;
  antecedente_esposo: string | null;
  nro_hijos_fallecidos: number | null;
  tags_familiares: string[] | null;
}
