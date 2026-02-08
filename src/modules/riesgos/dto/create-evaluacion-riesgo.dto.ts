import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoPeligro,
  Probabilidad,
  Consecuencia,
  NivelRiesgo,
  EstadoEvaluacionRiesgo,
} from '../entities/evaluacion-riesgo.entity';
import { JerarquiaControl, EstadoMedida } from '../entities/medida-control.entity';

export class MedidaControlDto {
  @IsEnum(JerarquiaControl)
  jerarquia: JerarquiaControl;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsUUID()
  responsable_id?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  fecha_implementacion?: string;

  @IsOptional()
  @IsEnum(EstadoMedida)
  estado?: EstadoMedida;
}

export class CreateEvaluacionRiesgoDto {
  @IsString()
  actividad: string;

  @IsString()
  peligro_identificado: string;

  @IsEnum(TipoPeligro)
  tipo_peligro: TipoPeligro;

  @IsString()
  @IsDateString()
  fecha_evaluacion: string;

  @IsEnum(Probabilidad)
  probabilidad: Probabilidad;

  @IsEnum(Consecuencia)
  consecuencia: Consecuencia;

  @IsEnum(NivelRiesgo)
  nivel_riesgo: NivelRiesgo;

  @IsOptional()
  @IsString()
  controles_actuales?: string;

  @IsOptional()
  @IsEnum(NivelRiesgo)
  riesgo_residual?: NivelRiesgo;

  @IsOptional()
  @IsEnum(EstadoEvaluacionRiesgo)
  estado?: EstadoEvaluacionRiesgo;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedidaControlDto)
  medidas_control?: MedidaControlDto[];

  @IsUUID()
  empresa_id: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsUUID()
  evaluador_id: string;

  @IsOptional()
  @IsUUID()
  iperc_padre_id?: string;
}
