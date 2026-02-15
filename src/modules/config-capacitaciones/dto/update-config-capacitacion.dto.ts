import { IsOptional, IsNumber, IsBoolean, IsArray, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ResponsableCertificacionItemDto {
  @IsString()
  nombre_completo: string;

  @IsString()
  numero_documento: string;

  @IsString()
  tipo_documento: string;
}

export class RegistroAsistenciaItemDto {
  @IsString()
  codigo_documento: string;

  @IsString()
  version: string;

  @IsString()
  fecha_version: string;

  @IsString()
  vigencia_inicio: string;

  @IsString()
  vigencia_fin: string;
}

export class FirmasCertificadoDto {
  @IsOptional()
  @IsBoolean()
  responsable_rrhh?: boolean;

  @IsOptional()
  @IsBoolean()
  responsable_sst?: boolean;

  @IsOptional()
  @IsBoolean()
  capacitador?: boolean;

  @IsOptional()
  @IsBoolean()
  responsable_certificacion?: boolean;
}

export class UpdateConfigCapacitacionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  nota_minima_aprobatoria?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bloquear_evaluacion_nota_menor_igual?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limite_intentos?: number;

  @IsOptional()
  @IsBoolean()
  bloquear_despues_aprobacion?: boolean;

  @IsOptional()
  @IsBoolean()
  habilitar_firma_solo_aprobados?: boolean;

  @IsOptional()
  @IsBoolean()
  habilitar_encuesta_satisfaccion?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tipos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grupos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ubicaciones?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsableCertificacionItemDto)
  responsables_certificacion?: ResponsableCertificacionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistroAsistenciaItemDto)
  registro_asistencia?: RegistroAsistenciaItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FirmasCertificadoDto)
  firmas_certificado?: FirmasCertificadoDto;
}
