export class ResponseConfigEppDto {
  umbral_vigencia_meses: number;
  umbral_costo: number;
  whatsapp_numero: string | null;
  whatsapp_nombre: string | null;

  static fromEntity(entity: any): ResponseConfigEppDto {
    const dto = new ResponseConfigEppDto();
    dto.umbral_vigencia_meses = Number(entity.umbralVigenciaMeses) ?? 6;
    dto.umbral_costo = Number(entity.umbralCosto) ?? 50;
    dto.whatsapp_numero = entity.whatsappNumero ?? null;
    dto.whatsapp_nombre = entity.whatsappNombre ?? null;
    return dto;
  }
}
