import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PasoDto {
  @IsString()
  numero: number;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  peligros?: string;

  @IsOptional()
  @IsString()
  medidas_control?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  epp_requerido?: string[];
}

export class CreatePetsDto {
  @IsString()
  codigo: string;

  @IsString()
  titulo: string;

  @IsString()
  objetivo: string;

  @IsString()
  alcance: string;

  @IsOptional()
  @IsString()
  definiciones?: string;

  @IsOptional()
  @IsString()
  area_proceso?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referencias_normativas?: string[];

  @IsOptional()
  equipos_materiales?: Array<{
    nombre: string;
    tipo: string;
    obligatorio: boolean;
  }>;

  @IsOptional()
  requisitos_previos?: {
    competencias?: string[];
    herramientas?: string[];
    permisos_asociados?: string[];
  };

  @IsString()
  @IsDateString()
  fecha_emision: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  fecha_revision?: string;

  @IsUUID()
  elaborador_id: string;

  @IsUUID()
  empresa_id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PasoDto)
  pasos?: PasoDto[];
}
