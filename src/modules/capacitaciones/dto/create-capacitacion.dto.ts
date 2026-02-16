import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoCapacitacion, EstadoCapacitacion } from '../entities/capacitacion.entity';

export class PreguntaInstruccionDto {
  @IsString()
  texto_pregunta: string;

  @IsString()
  tipo: 'OpcionMultiple' | 'VerdaderoFalso';

  @IsArray()
  @IsString({ each: true })
  opciones: string[];

  @IsNumber()
  respuesta_correcta_index: number;

  @IsNumber()
  puntaje: number;
}

export class PasoInstruccionDto {
  @IsString()
  id: string;

  @IsString()
  descripcion: string;

  @IsBoolean()
  esEvaluacion: boolean;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsBoolean()
  firmaRegistro?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreguntaInstruccionDto)
  preguntas?: PreguntaInstruccionDto[];
}

export class ParticipanteDto {
  @IsUUID()
  trabajador_id: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  asistencia?: boolean;

  @IsOptional()
  @IsNumber()
  calificacion?: number;

  @IsOptional()
  @IsBoolean()
  aprobado?: boolean;

  @IsOptional()
  @IsBoolean()
  firmo?: boolean;
}

export class CreateCapacitacionDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsEnum(TipoCapacitacion)
  tipo: TipoCapacitacion;

  @IsString()
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  sede?: string;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  grupo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PasoInstruccionDto)
  instrucciones?: PasoInstruccionDto[];

  @IsOptional()
  @IsString()
  hora_inicio?: string;

  @IsOptional()
  @IsString()
  hora_fin?: string;

  @IsOptional()
  @IsNumber()
  duracion_horas?: number;

  /** Duración en formato "HH:MM" (ej: "02:40") */
  @IsOptional()
  @IsString()
  duracion_hhmm?: string;

  @IsOptional()
  @IsNumber()
  duracion_minutos?: number;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsUUID()
  instructor_id?: string;

  @IsOptional()
  @IsString()
  firma_capacitador_url?: string;

  @IsOptional()
  @IsUrl()
  material_url?: string;

  @IsOptional()
  @IsUrl()
  certificado_url?: string;

  @IsOptional()
  @IsEnum(EstadoCapacitacion)
  estado?: EstadoCapacitacion;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipanteDto)
  participantes?: ParticipanteDto[];

  @IsOptional()
  @IsUUID()
  empresa_id?: string;

  @IsUUID()
  creado_por_id: string;
}
