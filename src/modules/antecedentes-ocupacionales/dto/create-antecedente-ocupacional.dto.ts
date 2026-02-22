import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAntecedenteOcupacionalDto {
  @IsString()
  empresa: string;

  @IsOptional()
  @IsString()
  area_trabajo?: string;

  @IsString()
  ocupacion: string;

  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  tiempo_total?: string;

  @IsOptional()
  @IsString()
  riesgos?: string;

  @IsOptional()
  @IsString()
  epp_utilizado?: string;
}
