import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  IsInt,
  ValidateNested,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoIncidente,
  SeveridadIncidente,
  EstadoIncidente,
} from '../entities/incidente.entity';

export class TestigoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  contacto?: string;
}

export class CreateIncidenteDto {
  @IsEnum(TipoIncidente)
  tipo: TipoIncidente;

  @IsEnum(SeveridadIncidente)
  severidad: SeveridadIncidente;

  @IsString()
  @IsDateString()
  fecha_hora: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  parte_cuerpo_afectada?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  dias_perdidos?: number;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fotos?: string[];

  @IsOptional()
  @IsString()
  causas?: string;

  @IsOptional()
  @IsString()
  acciones_inmediatas?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestigoDto)
  testigos?: TestigoDto[];

  @IsOptional()
  @IsString()
  acciones_correctivas?: string;

  @IsOptional()
  @IsEnum(EstadoIncidente)
  estado?: EstadoIncidente;

  @IsString()
  area_trabajo: string;

  @IsOptional()
  @IsUUID()
  trabajador_afectado_id?: string;

  @IsOptional()
  @IsString()
  trabajador_afectado?: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsOptional()
  @IsUUID()
  responsable_investigacion_id?: string;

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  reportado_por_id: string;
}
