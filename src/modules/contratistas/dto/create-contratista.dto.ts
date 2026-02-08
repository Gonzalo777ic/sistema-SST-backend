import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsEmail,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUrl,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoContratista } from '../entities/contratista.entity';
import { TipoDocumentoContratista } from '../entities/documento-contratista.entity';

export class DocumentoContratistaDto {
  @IsEnum(TipoDocumentoContratista)
  tipo_documento: TipoDocumentoContratista;

  @IsUrl()
  archivo_url: string;

  @IsString()
  @IsDateString()
  fecha_emision: string;

  @IsString()
  @IsDateString()
  fecha_vencimiento: string;
}

export class CreateContratistaDto {
  @IsString()
  @Min(11)
  @Max(11)
  ruc: string;

  @IsString()
  razon_social: string;

  @IsString()
  tipo_servicio: string;

  @IsString()
  representante_legal: string;

  @IsString()
  contacto_principal: string;

  @IsString()
  telefono: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(EstadoContratista)
  estado?: EstadoContratista;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  evaluacion_desempeno?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  supervisor_asignado_id?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentoContratistaDto)
  documentos?: DocumentoContratistaDto[];

  @IsUUID()
  empresa_id: string;
}
