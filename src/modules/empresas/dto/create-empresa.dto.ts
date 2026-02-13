import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNumber,
  Min,
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

  @IsString({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsString({ message: 'La actividad económica es obligatoria' })
  actividad_economica: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  numero_trabajadores?: number;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
