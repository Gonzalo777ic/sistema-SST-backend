import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { TipoProteccionEPP, CategoriaEPP, VigenciaEPP, CategoriaCriticidadEPP } from '../entities/epp.entity';

export class CreateEppDto {
  @IsString()
  nombre: string;

  @IsEnum(TipoProteccionEPP)
  tipo_proteccion: TipoProteccionEPP;

  @IsOptional()
  @IsEnum(CategoriaEPP)
  categoria?: CategoriaEPP;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  imagen_url?: string;

  @IsOptional()
  @IsEnum(VigenciaEPP)
  vigencia?: VigenciaEPP;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;

  @IsOptional()
  @IsEnum(CategoriaCriticidadEPP)
  categoria_criticidad?: CategoriaCriticidadEPP;

  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  adjunto_pdf_url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsUUID()
  empresa_id: string;
}
