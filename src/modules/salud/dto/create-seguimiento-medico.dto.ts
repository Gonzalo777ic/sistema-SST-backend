import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import {
  TipoSeguimiento,
  EspecialidadSeguimiento,
  EstadoSeguimiento,
} from '../entities/seguimiento-medico.entity';

export class CreateSeguimientoMedicoDto {
  @IsEnum(TipoSeguimiento)
  tipo: TipoSeguimiento;

  @IsString()
  cie10_code: string;

  @IsOptional()
  @IsString()
  cie10_description?: string;

  @IsEnum(EspecialidadSeguimiento)
  especialidad: EspecialidadSeguimiento;

  @IsDateString()
  plazo: string;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsEnum(EstadoSeguimiento)
  estado?: EstadoSeguimiento;
}
