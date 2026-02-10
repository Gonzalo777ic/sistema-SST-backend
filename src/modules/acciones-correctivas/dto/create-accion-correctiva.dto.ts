import {
  IsEnum,
  IsString,
  IsDateString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { FuenteAccion } from '../entities/accion-correctiva.entity';

export class CreateAccionCorrectivaDto {
  @IsEnum(FuenteAccion)
  fuente: FuenteAccion;

  @IsString()
  @MaxLength(500)
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  fecha_programada: string;

  @IsDateString()
  @IsOptional()
  fecha_ejecucion?: string;

  @IsDateString()
  @IsOptional()
  fecha_aprobacion?: string;

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  @IsOptional()
  area_id?: string;

  @IsUUID()
  elaborado_por_id: string;

  @IsUUID()
  responsable_levantamiento_id: string;

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
