import { IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class UpdateConfigEppDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  umbral_vigencia_meses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  umbral_costo?: number;
}
