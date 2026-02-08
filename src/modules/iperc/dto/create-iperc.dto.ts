import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  IsBoolean,
  IsInt,
  ValidateNested,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoIPERC } from '../entities/iperc.entity';
import { NivelRiesgo } from '../entities/linea-iperc.entity';

export class LineaIpercDto {
  @IsInt()
  numero: number;

  @IsString()
  actividad: string;

  @IsString()
  tarea: string;

  @IsOptional()
  @IsString()
  puesto_trabajo?: string;

  @IsString()
  peligro: string;

  @IsString()
  riesgo: string;

  @IsOptional()
  @IsString()
  requisito_legal?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  probabilidad_a: number;

  @IsInt()
  @Min(1)
  @Max(5)
  probabilidad_b: number;

  @IsInt()
  @Min(1)
  @Max(5)
  probabilidad_c: number;

  @IsInt()
  @Min(1)
  @Max(5)
  probabilidad_d: number;

  @IsInt()
  @Min(1)
  @Max(5)
  indice_severidad: number;

  @IsOptional()
  @IsBoolean()
  jerarquia_eliminacion?: boolean;

  @IsOptional()
  @IsBoolean()
  jerarquia_sustitucion?: boolean;

  @IsOptional()
  @IsBoolean()
  jerarquia_controles_ingenieria?: boolean;

  @IsOptional()
  @IsBoolean()
  jerarquia_controles_admin?: boolean;

  @IsOptional()
  @IsBoolean()
  jerarquia_epp?: boolean;

  @IsString()
  medidas_control: string;

  @IsOptional()
  @IsString()
  responsable?: string;
}

export class CreateIpercDto {
  @IsString()
  razon_social: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsString()
  proceso: string;

  @IsString()
  @IsDateString()
  fecha_elaboracion: string;

  @IsOptional()
  @IsString()
  elaborado_por?: string;

  @IsOptional()
  @IsEnum(EstadoIPERC)
  estado?: EstadoIPERC;

  @IsOptional()
  @IsUrl()
  firma_elaborador?: string;

  @IsOptional()
  @IsString()
  aprobado_por?: string;

  @IsOptional()
  @IsUrl()
  firma_aprobador?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaIpercDto)
  lineas_iperc?: LineaIpercDto[];

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  elaborado_por_id: string;

  @IsOptional()
  @IsUUID()
  aprobado_por_id?: string;
}
