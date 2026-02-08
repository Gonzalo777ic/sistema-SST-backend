import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @Length(11, 11, { message: 'El RUC debe tener exactamente 11 dígitos' })
  @Matches(/^\d{11}$/, { message: 'El RUC debe contener solo números' })
  ruc: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
