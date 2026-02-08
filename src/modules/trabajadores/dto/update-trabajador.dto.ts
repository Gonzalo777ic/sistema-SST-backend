import { PartialType } from '@nestjs/mapped-types';
import { CreateTrabajadorDto } from './create-trabajador.dto';
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class UpdateTrabajadorDto extends PartialType(CreateTrabajadorDto) {
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
}
