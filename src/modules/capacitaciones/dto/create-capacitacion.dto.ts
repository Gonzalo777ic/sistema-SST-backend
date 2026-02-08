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
}

export class CreateCapacitacionDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  lugar: string;

  @IsEnum(TipoCapacitacion)
  tipo: TipoCapacitacion;

  @IsString()
  @IsDateString()
  fecha: string;

  @IsString()
  hora_inicio: string;

  @IsString()
  hora_fin: string;

  @IsNumber()
  duracion_horas: number;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsUUID()
  instructor_id?: string;

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

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  creado_por_id: string;
}
