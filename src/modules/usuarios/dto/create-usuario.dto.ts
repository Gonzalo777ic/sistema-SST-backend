import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { AuthProvider, UsuarioRol } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @IsString()
  @MinLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @MaxLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @Matches(/^\d+$/, { message: 'El DNI debe contener solo números' })
  dni: string;

  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  password?: string;

  @IsOptional()
  @IsEnum(AuthProvider, { message: 'auth_provider debe ser LOCAL, GOOGLE o MICROSOFT' })
  authProvider?: AuthProvider = AuthProvider.LOCAL;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsArray()
  @IsEnum(UsuarioRol, { each: true })
  roles: UsuarioRol[];

  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @IsOptional()
  @IsUUID()
  trabajadorId?: string;
}
