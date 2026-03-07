import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateDocumentoNormativoDto {
  @IsString()
  nombre: string;

  @IsUrl()
  archivo_url: string;

  @IsOptional()
  @IsString()
  version?: string;
}
