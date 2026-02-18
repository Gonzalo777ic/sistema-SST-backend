import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { UsuarioRol } from '../entities/usuario.entity';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsArray()
  @IsEnum(UsuarioRol, { each: true })
  roles?: UsuarioRol[];

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  debe_cambiar_password?: boolean;

  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @IsOptional()
  @IsUUID()
  trabajadorId?: string;

  @IsOptional()
  @IsUUID()
  centroMedicoId?: string | null;
}
