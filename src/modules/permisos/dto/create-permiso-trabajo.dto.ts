import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoPermiso, EstadoPermiso } from '../entities/permiso-trabajo.entity';

export class TrabajadorPermisoDto {
  @IsUUID()
  trabajador_id: string;

  @IsString()
  nombre: string;

  @IsString()
  documento: string;

  @IsOptional()
  @IsString()
  rol?: string;
}

export class PeligroIdentificadoDto {
  @IsString()
  peligro: string;

  @IsString()
  riesgo: string;

  @IsString()
  medida_control: string;
}

export class CreatePermisoTrabajoDto {
  @IsOptional()
  @IsString()
  numero_permiso?: string;

  @IsEnum(TipoPermiso)
  tipo_permiso: TipoPermiso;

  @IsString()
  @IsDateString()
  fecha_inicio: string;

  @IsString()
  @IsDateString()
  fecha_fin: string;

  @IsString()
  ubicacion_especifica: string;

  @IsString()
  descripcion_trabajo: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  epp_requerido?: string[];

  @IsOptional()
  @IsString()
  herramientas_equipos?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeligroIdentificadoDto)
  peligros_identificados?: PeligroIdentificadoDto[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fotos_evidencia?: string[];

  @IsUUID()
  supervisor_responsable_id: string;

  @IsOptional()
  @IsUUID()
  aprobador_sst_id?: string;

  @IsOptional()
  @IsUrl()
  firma_supervisor_url?: string;

  @IsOptional()
  @IsUrl()
  firma_aprobador_url?: string;

  @IsOptional()
  @IsEnum(EstadoPermiso)
  estado?: EstadoPermiso;

  @IsUUID()
  empresa_id: string;

  @IsOptional()
  @IsUUID()
  area_trabajo_id?: string;

  @IsUUID()
  creado_por_id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrabajadorPermisoDto)
  trabajadores?: TrabajadorPermisoDto[];
}
