import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FilaImportacionDto {
  @IsString()
  tipo_doc: string;

  @IsString()
  nro_doc: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido_paterno: string;

  @IsString()
  @IsOptional()
  apellido_materno: string;

  @IsString()
  empresa: string;
}

export class ProcesarImportacionDto {

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilaImportacionDto)
  filas: FilaImportacionDto[];

  @IsOptional()
  @IsBoolean()
  crearUsuarios?: boolean;
}
