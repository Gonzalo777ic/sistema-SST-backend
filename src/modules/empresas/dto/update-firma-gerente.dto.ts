import { IsString, IsOptional } from 'class-validator';

export class UpdateFirmaGerenteDto {
  @IsOptional()
  @IsString()
  rol?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  /** Base64 de imagen (data:image/...) para actualizar firma */
  @IsOptional()
  firma_base64?: string | null;
}
