import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AuthProvider, UsuarioRol } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El email debe ser un correo corporativo válido' })
  email: string;

  @ValidateIf((o) => o.authProvider === AuthProvider.LOCAL)
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
