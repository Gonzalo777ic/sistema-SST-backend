import { IsString, IsOptional, ValidateNested, IsObject, MinLength, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UsuarioCentroMedicoDto {
  @IsString()
  @MinLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @MaxLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @Matches(/^\d+$/, { message: 'El DNI debe contener solo números' })
  dni: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  nombres?: string;

  @IsString()
  @IsOptional()
  apellido_paterno?: string;

  @IsString()
  @IsOptional()
  apellido_materno?: string;
}

export class CreateCentroMedicoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  archivo_pdf_base64?: string;

  /** Usuario inicial para acceso al sistema. Al crear el centro se crea el usuario y se vincula automáticamente. */
  @IsOptional()
  @ValidateNested()
  @Type(() => UsuarioCentroMedicoDto)
  @IsObject()
  usuario_crear?: UsuarioCentroMedicoDto;
}
