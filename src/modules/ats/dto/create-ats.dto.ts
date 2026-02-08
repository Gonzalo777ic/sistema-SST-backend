import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoATS } from '../entities/ats.entity';

export class PersonalInvolucradoDto {
  @IsString()
  nombre: string;

  @IsString()
  documento: string;

  @IsOptional()
  @IsUrl()
  firma_url?: string;
}

export class PasoTrabajoDto {
  @IsString()
  numero: number;

  @IsString()
  paso_tarea: string;

  @IsString()
  peligros_riesgos: string;

  @IsString()
  medidas_control: string;

  @IsOptional()
  @IsString()
  responsable?: string;
}

export class PermisosEspecialesDto {
  @IsOptional()
  @IsBoolean()
  trabajo_altura?: boolean;

  @IsOptional()
  @IsBoolean()
  trabajo_caliente?: boolean;

  @IsOptional()
  @IsBoolean()
  espacio_confinado?: boolean;

  @IsOptional()
  @IsBoolean()
  excavacion?: boolean;

  @IsOptional()
  @IsBoolean()
  energia_electrica?: boolean;
}

export class CreateAtsDto {
  @IsOptional()
  @IsString()
  numero_ats?: string;

  @IsString()
  @IsDateString()
  fecha: string;

  @IsUUID('all', { message: 'El área es obligatoria' })
  area_id: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsString()
  trabajo_a_realizar: string;

  @IsOptional()
  @IsString()
  hora_inicio?: string;

  @IsOptional()
  @IsString()
  hora_fin?: string;

  @IsOptional()
  @IsString()
  herramientas_equipos?: string;

  @IsOptional()
  @IsString()
  condiciones_climaticas?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  epp_requerido?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PermisosEspecialesDto)
  permisos_especiales?: PermisosEspecialesDto;

  @IsOptional()
  @IsString()
  elaborado_por?: string;

  @IsOptional()
  @IsString()
  supervisor?: string;

  @IsOptional()
  @IsUrl()
  firma_elaborador?: string;

  @IsOptional()
  @IsUrl()
  firma_supervisor_url?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalInvolucradoDto)
  personal_involucrado?: PersonalInvolucradoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PasoTrabajoDto)
  pasos_trabajo?: PasoTrabajoDto[];

  @IsOptional()
  @IsEnum(EstadoATS)
  estado?: EstadoATS;

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  elaborado_por_id: string;

  @IsOptional()
  @IsUUID()
  supervisor_id?: string;
}
