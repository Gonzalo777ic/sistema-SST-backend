import { IsUUID, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateDifusionDocumentoDto {
  @IsUUID()
  documento_id: string;

  @IsDateString()
  fecha_difusion: string;

  @IsBoolean()
  @IsOptional()
  requiere_firma?: boolean;

  @IsUUID()
  empresa_id: string;

  @IsUUID()
  responsable_id: string;
}
