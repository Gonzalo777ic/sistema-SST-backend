import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoInspeccion, EstadoInspeccion } from '../entities/inspeccion.entity';
import { CriticidadHallazgo } from '../entities/hallazgo-inspeccion.entity';

export class HallazgoDto {
  @IsString()
  descripcion: string;

  @IsEnum(CriticidadHallazgo)
  criticidad: CriticidadHallazgo;

  @IsOptional()
  @IsUrl()
  foto_url?: string;

  @IsString()
  accion_correctiva: string;

  @IsUUID()
  responsable_id: string;

  @IsString()
  @IsDateString()
  fecha_limite: string;

  @IsOptional()
  estado?: string;
}

export class CreateInspeccionDto {
  @IsEnum(TipoInspeccion)
  tipo_inspeccion: TipoInspeccion;

  @IsString()
  @IsDateString()
  fecha_inspeccion: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  puntuacion?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fotos_generales?: string[];

  @IsOptional()
  @IsEnum(EstadoInspeccion)
  estado?: EstadoInspeccion;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HallazgoDto)
  hallazgos?: HallazgoDto[];

  @IsUUID()
  empresa_id: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsUUID()
  inspector_id: string;
}
