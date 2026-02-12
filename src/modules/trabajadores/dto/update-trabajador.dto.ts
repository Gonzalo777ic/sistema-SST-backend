import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTrabajadorDto } from './create-trabajador.dto';
import { IsOptional, IsString, IsBoolean, IsUUID, ValidateIf } from 'class-validator';

export class UpdateTrabajadorDto extends PartialType(
  OmitType(CreateTrabajadorDto, ['talla_calzado', 'empresa_id', 'tipo_documento', 'numero_documento', 'area_id'] as const)
) {
  // Redefinir area_id explícitamente para permitir manejo de null/string vacío
  @IsOptional()
  @ValidateIf((o) => o.area_id !== undefined && o.area_id !== null && o.area_id !== '')
  @IsUUID()
  area_id?: string;

  @IsOptional()
  @IsString()
  talla_casco?: string;

  @IsOptional()
  @IsString()
  talla_camisa?: string;

  @IsOptional()
  @IsString()
  talla_pantalon?: string;

  // talla_calzado puede venir como string desde el frontend pero se convierte a number en el servicio
  @IsOptional()
  @IsString()
  talla_calzado?: string;

  @IsOptional()
  @IsBoolean()
  perfil_completado?: boolean;
}

export class UpdatePersonalDataDto {
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
  @IsString()
  firma_digital_url?: string;
}
