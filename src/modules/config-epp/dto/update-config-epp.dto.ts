import { IsOptional, IsInt, Min, IsNumber, IsString, MaxLength } from 'class-validator';

export class UpdateConfigEppDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  umbral_vigencia_meses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  umbral_costo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsapp_numero?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  whatsapp_nombre?: string | null;
}
