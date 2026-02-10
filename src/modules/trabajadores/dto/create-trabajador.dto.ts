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
  contacto_emergencia_nombre?: string;

  @IsOptional()
  @IsString()
  contacto_emergencia_telefono?: string;

  @IsOptional()
  @IsUrl()
  foto_url?: string;

  @IsOptional()
  @IsString()
  talla_casco?: string;

  @IsOptional()
  @IsString()
  talla_camisa?: string;

  @IsOptional()
  @IsString()
  talla_pantalon?: string;

  @IsOptional()
  @IsString()
  talla_calzado?: string;

  @IsOptional()
  perfil_completado?: boolean;

  @IsUUID()
  empresa_id: string;
}
