import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { EstadoTrabajador, GrupoSanguineo } from '../entities/trabajador.entity';

export class CreateTrabajadorDto {
  @IsString()
  nombre_completo: string;

  @IsString()
  documento_identidad: string;

  @IsString()
  cargo: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @IsDateString()
  fecha_ingreso: string;

  @IsOptional()
  @IsEnum(EstadoTrabajador)
  estado?: EstadoTrabajador = EstadoTrabajador.Activo;

  @IsOptional()
  @IsEnum(GrupoSanguineo)
  grupo_sanguineo?: GrupoSanguineo;

  @IsOptional()
  @IsString()
  contacto_emergencia?: string;

  @IsOptional()
  @IsUrl()
  foto_url?: string;

  @IsUUID()
  empresa_id: string;
}
