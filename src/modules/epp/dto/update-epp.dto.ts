import { PartialType } from '@nestjs/mapped-types';
import { CreateEppDto } from './create-epp.dto';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsUrl,
} from 'class-validator';
import { TipoProteccionEPP, CategoriaEPP, VigenciaEPP, CategoriaCriticidadEPP } from '../entities/epp.entity';
import { IsNumber } from 'class-validator';

export class UpdateEppDto extends PartialType(CreateEppDto) {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoProteccionEPP)
  tipo_proteccion?: TipoProteccionEPP;

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
}
