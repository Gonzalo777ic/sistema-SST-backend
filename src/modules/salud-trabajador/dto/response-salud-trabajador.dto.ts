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
}
