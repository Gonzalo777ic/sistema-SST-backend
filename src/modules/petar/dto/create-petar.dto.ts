import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoTrabajoPETAR, EstadoPETAR } from '../entities/petar.entity';

export class TrabajadorPetarDto {
  @IsOptional()
  @IsUUID()
  trabajador_id?: string;

  @IsString()
  nombre: string;

  @IsString()
  documento: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class PeligroPetarDto {
  @IsString()
  peligro: string;

  @IsString()
  riesgo: string;

  @IsString()
  nivel_inicial: string;

  @IsString()
  medida_control: string;

  @IsString()
  nivel_residual: string;
}

export class CondicionPreviaDto {
  @IsString()
  condicion: string;

  @IsBoolean()
  verificado: boolean;
}

export class ChecklistVerificacionDto {
  @IsString()
  item: string;

  @IsBoolean()
  cumple: boolean;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class CreatePetarDto {
  @IsOptional()
  @IsString()
  codigo?: string;

  @IsEnum(TipoTrabajoPETAR)
  tipo_trabajo: TipoTrabajoPETAR;

  @IsString()
  descripcion_tarea: string;

  @IsString()
  area: string;

  @IsString()
  @IsDateString()
  fecha_inicio: string;

  @IsString()
  @IsDateString()
  fecha_fin: string;

  @IsOptional()
  @IsString()
  equipos_herramientas?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  epp_requerido?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CondicionPreviaDto)
  condiciones_previas?: CondicionPreviaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistVerificacionDto)
  checklist_verificacion?: ChecklistVerificacionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeligroPetarDto)
  peligros?: PeligroPetarDto[];

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsUUID()
  supervisor_responsable_id: string;

  @IsOptional()
  @IsUUID()
  empresa_contratista_id?: string;

  @IsOptional()
  @IsUrl()
  firma_supervisor_url?: string;

  @IsOptional()
  @IsUrl()
  firma_sst_url?: string;

  @IsOptional()
  @IsString()
  aprobador_sst?: string;

  @IsOptional()
  @IsEnum(EstadoPETAR)
  estado?: EstadoPETAR;

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  creado_por_id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrabajadorPetarDto)
  trabajadores?: TrabajadorPetarDto[];
}
