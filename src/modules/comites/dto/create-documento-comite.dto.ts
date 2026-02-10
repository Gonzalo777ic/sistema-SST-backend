import {
  IsString,
  IsUrl,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateDocumentoComiteDto {
  @IsString()
  titulo: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsDateString()
  fecha_registro?: string;
}
