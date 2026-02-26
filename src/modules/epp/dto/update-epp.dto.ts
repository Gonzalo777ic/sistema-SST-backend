import { PartialType } from '@nestjs/mapped-types';
import { CreateEppDto } from './create-epp.dto';
import {
  IsOptional,
  IsString,
  IsEnum,
  Min,
  IsUrl,
  ValidateIf,
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
  @ValidateIf((o) => o.imagen_url != null && o.imagen_url !== '')
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
  @ValidateIf((o) => o.adjunto_pdf_url != null && o.adjunto_pdf_url !== '')
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  adjunto_pdf_url?: string;
}
