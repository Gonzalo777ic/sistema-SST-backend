import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateComiteDto {
  @IsUUID()
  empresa_id: string;

  @IsString()
  nombre: string;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;

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
