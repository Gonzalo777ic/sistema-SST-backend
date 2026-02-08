import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @MaxLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @Matches(/^\d+$/, { message: 'El DNI debe contener solo números' })
  dni: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  password: string;
}
