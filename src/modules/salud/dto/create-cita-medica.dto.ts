import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { EstadoCita } from '../entities/cita-medica.entity';

export class CreateCitaMedicaDto {
  @IsString()
  motivo: string;

  @IsString()
  @IsDateString()
  fecha_cita: string;

  @IsString()
  hora_cita: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duracion_minutos?: number;

  @IsOptional()
  @IsString()
  notas_cita?: string;

  @IsOptional()
  @IsString()
  doctor_nombre?: string;

  @IsUUID()
  trabajador_id: string;

  @IsOptional()
  @IsUUID()
  doctor_id?: string;

  @IsOptional()
  @IsUUID()
  examen_relacionado_id?: string;

  @IsOptional()
  @IsEnum(EstadoCita)
  estado?: EstadoCita;
}
