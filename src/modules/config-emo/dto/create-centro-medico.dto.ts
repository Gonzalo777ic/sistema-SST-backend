import { IsString, IsOptional } from 'class-validator';

export class CreateCentroMedicoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  archivo_pdf_base64?: string;
}
