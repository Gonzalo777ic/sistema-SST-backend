import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsUrl,
  IsArray,
} from 'class-validator';
import { TipoExamen, ResultadoExamen, EstadoExamen } from '../entities/examen-medico.entity';

export class CreateExamenMedicoDto {
  @IsUUID()
  trabajador_id: string;

  @IsEnum(TipoExamen)
  tipo_examen: TipoExamen;

  @IsString()
  @IsDateString()
  fecha_programada: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  fecha_realizado?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  fecha_vencimiento?: string;

  @IsString()
  centro_medico: string;

  @IsOptional()
  @IsString()
  medico_evaluador?: string;

  @IsOptional()
  @IsString()
  hora_programacion?: string;

  @IsOptional()
  @IsUUID()
  perfil_emo_id?: string;

  @IsOptional()
  @IsString()
  proyecto?: string;

  @IsOptional()
  @IsString()
  adicionales?: string;

  @IsOptional()
  @IsString()
  recomendaciones_personalizadas?: string;

  @IsOptional()
  @IsEnum(ResultadoExamen)
  resultado?: ResultadoExamen;

  @IsOptional()
  @IsString()
  restricciones?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  diagnosticos_cie10?: Array<{ code: string; description: string }>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programas_vigilancia?: string[];

  @IsOptional()
  @IsUrl()
  resultado_archivo_url?: string;

  @IsOptional()
  @IsEnum(EstadoExamen)
  estado?: EstadoExamen;

  @IsUUID()
  cargado_por_id: string;
}
