import { IsUUID, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class AgregarUsuarioACentroDto {
  @IsString()
  @MinLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @MaxLength(8, { message: 'El DNI debe tener 8 dígitos' })
  @Matches(/^\d+$/, { message: 'El DNI debe contener solo números' })
  dni: string;

  @IsUUID('4', { message: 'Debe seleccionar un centro médico válido' })
  centro_medico_id: string;
}
