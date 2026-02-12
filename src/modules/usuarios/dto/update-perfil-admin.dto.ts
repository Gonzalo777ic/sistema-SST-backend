import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdatePerfilAdminDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido_paterno?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido_materno?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener 8 dígitos' })
  dni?: string;

  /** Base64 de la imagen de firma (data:image/png;base64,...) */
  @IsOptional()
  @IsString()
  firma_base64?: string;
}
