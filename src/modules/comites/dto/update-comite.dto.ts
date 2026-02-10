import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateComiteDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  nro_miembros?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
