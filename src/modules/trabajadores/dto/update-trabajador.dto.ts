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

  @IsOptional()
  @IsString()
  firma_digital_url?: string;
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

/** DTO para onboarding de Médico Ocupacional */
export class UpdateMedicoPersonalDataDto {
  @IsOptional()
  @IsString()
  cmp?: string;

  @IsOptional()
  @IsString()
  rne?: string;

  @IsOptional()
  @IsString()
  firma_digital_url?: string;

  /** Base64 de firma procesada (imagen subida) - prevalece sobre dibujo */
  @IsOptional()
  @IsString()
  firma_imagen_base64?: string;

  /** Base64 del sello final (generado por sistema o custom) */
  @IsOptional()
  @IsString()
  sello_base64?: string;

  /** Texto debajo del nombre en el sello (ej. MÉDICO OCUPACIONAL) */
  @IsOptional()
  @IsString()
  titulo_sello?: string;

  /** Logo para documentos (Cargo, Certificado, Carta). Base64 o URL. Si vacío, se muestra solo texto. */
  @IsOptional()
  @IsString()
  logo_documentos_base64?: string;

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
}
