import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { DiaSemana } from '../entities/horario-doctor.entity';

export class CreateHorarioDoctorDto {
  @IsEnum(DiaSemana)
  dia_semana: DiaSemana;

  @IsString()
  hora_inicio: string;

  @IsString()
  hora_fin: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duracion_cita_minutos?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsUUID()
  doctor_id: string;

  @IsUUID()
  empresa_id: string;
}
