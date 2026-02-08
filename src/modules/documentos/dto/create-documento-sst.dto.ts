import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';
import { CategoriaDocumento } from '../entities/documento-sst.entity';

export class CreateDocumentoSstDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  version: string;

  @IsEnum(CategoriaDocumento)
  categoria: CategoriaDocumento;

  @IsUrl()
  archivo_url: string;

  @IsString()
  formato: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tamano?: number;

  @IsString()
  @IsDateString()
  fecha_publicacion: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  subido_por_id: string;
}
