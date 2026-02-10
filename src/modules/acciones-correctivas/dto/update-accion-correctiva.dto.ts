import {
  IsEnum,
  IsString,
  IsDateString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { FuenteAccion, EstadoAccion } from '../entities/accion-correctiva.entity';

export class UpdateAccionCorrectivaDto {
  @IsEnum(FuenteAccion)
  @IsOptional()
  fuente?: FuenteAccion;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha_programada?: string;

  @IsDateString()
  @IsOptional()
  fecha_ejecucion?: string;

  @IsDateString()
  @IsOptional()
  fecha_aprobacion?: string;

  @IsEnum(EstadoAccion)
  @IsOptional()
  estado?: EstadoAccion;

  @IsUUID()
  @IsOptional()
  area_id?: string;

  @IsUUID()
  @IsOptional()
  responsable_levantamiento_id?: string;

  @IsUUID()
  @IsOptional()
  contratista_id?: string;

  @IsString()
  @IsOptional()
  sede?: string;

  @IsString()
  @IsOptional()
  unidad?: string;
}
