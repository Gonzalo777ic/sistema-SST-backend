import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTrabajadorDto } from './create-trabajador.dto';
import { IsOptional, IsString, IsBoolean, IsUUID, ValidateIf, IsInt } from 'class-validator';

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
  @IsString()
  talla_faja?: string;

  @IsOptional()
  @IsString()
  talla_guantes_anticorte?: string;

  @IsOptional()
  @IsString()
  talla_guantes_super_flex?: string;

  @IsOptional()
  @IsString()
  talla_guantes_nitrilo?: string;

  @IsOptional()
  @IsString()
  talla_overol?: string;

  @IsOptional()
  @IsBoolean()
  perfil_completado?: boolean;

  @IsOptional()
  @IsString()
  firma_digital_url?: string;
}

export class UpdatePersonalDataDto {
  // SST / Onboarding
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
  talla_faja?: string;

  @IsOptional()
  @IsString()
  talla_guantes_anticorte?: string;

  @IsOptional()
  @IsString()
  talla_guantes_super_flex?: string;

  @IsOptional()
  @IsString()
  talla_guantes_nitrilo?: string;

  @IsOptional()
  @IsString()
  talla_overol?: string;

  @IsOptional()
  @IsString()
  firma_digital_url?: string;

  /** Base64 de firma por imagen (prevalece sobre dibujo) */
  @IsOptional()
  @IsString()
  firma_imagen_base64?: string;

  // Datos de Contacto
  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email_personal?: string;

  // Ubicación
  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  distrito?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  numero_interior?: string;

  @IsOptional()
  @IsString()
  urbanizacion?: string;

  // Demografía / Familia
  @IsOptional()
  @IsString()
  estado_civil?: string;

  @IsOptional()
  @IsString()
  grado_instruccion?: string;

  @IsOptional()
  @IsInt()
  nro_hijos_vivos?: number;

  @IsOptional()
  @IsInt()
  nro_dependientes?: number;

  // Contacto de Emergencia
  @IsOptional()
  @IsString()
  contacto_emergencia_nombre?: string;

  @IsOptional()
  @IsString()
  contacto_emergencia_telefono?: string;

  // Residencia y Seguros (Anexo 02)
  @IsOptional()
  @IsBoolean()
  reside_en_lugar_trabajo?: boolean;

  @IsOptional()
  @IsString()
  tiempo_residencia_lugar_trabajo?: string;

  @IsOptional()
  @IsBoolean()
  seguro_essalud?: boolean;

  @IsOptional()
  @IsBoolean()
  seguro_eps?: boolean;

  @IsOptional()
  @IsBoolean()
  seguro_sctr?: boolean;

  @IsOptional()
  @IsString()
  seguro_otro?: string;
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

  @IsOptional()
  @IsString()
  talla_faja?: string;

  @IsOptional()
  @IsString()
  talla_guantes_anticorte?: string;

  @IsOptional()
  @IsString()
  talla_guantes_super_flex?: string;

  @IsOptional()
  @IsString()
  talla_guantes_nitrilo?: string;

  @IsOptional()
  @IsString()
  talla_overol?: string;
}
