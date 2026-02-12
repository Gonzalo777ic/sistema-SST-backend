export class ResponseConfigEppDto {
  umbral_vigencia_meses: number;
  umbral_costo: number;

  static fromEntity(entity: any): ResponseConfigEppDto {
    const dto = new ResponseConfigEppDto();
    dto.umbral_vigencia_meses = Number(entity.umbralVigenciaMeses) ?? 6;
    dto.umbral_costo = Number(entity.umbralCosto) ?? 50;
    return dto;
  }
}
