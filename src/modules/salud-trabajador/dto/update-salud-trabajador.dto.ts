import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSaludTrabajadorDto {
  @IsOptional()
  @IsBoolean()
  alergias?: boolean;

  @IsOptional()
  @IsBoolean()
  diabetes?: boolean;

  @IsOptional()
  @IsBoolean()
  tbc?: boolean;

  @IsOptional()
  @IsBoolean()
  hepatitis_b?: boolean;

  @IsOptional()
  @IsBoolean()
  asma?: boolean;

  @IsOptional()
  @IsBoolean()
  hta?: boolean;

  @IsOptional()
  @IsBoolean()
  its?: boolean;

  @IsOptional()
  @IsBoolean()
  tifoidea?: boolean;

  @IsOptional()
  @IsBoolean()
  bronquitis?: boolean;

  @IsOptional()
  @IsBoolean()
  neoplasia?: boolean;

  @IsOptional()
  @IsBoolean()
  convulsiones?: boolean;

  @IsOptional()
  @IsBoolean()
  quemaduras?: boolean;

  @IsOptional()
  @IsBoolean()
  cirugias?: boolean;

  @IsOptional()
  @IsBoolean()
  intoxicaciones?: boolean;

  @IsOptional()
  @IsBoolean()
  otros?: boolean;

  @IsOptional()
  @IsString()
  detalle_cirugias?: string;

  @IsOptional()
  @IsString()
  detalle_otros?: string;
}
