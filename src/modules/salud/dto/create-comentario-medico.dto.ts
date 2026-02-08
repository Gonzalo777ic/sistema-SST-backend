import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateComentarioMedicoDto {
  @IsUUID()
  examen_id: string;

  @IsUUID()
  trabajador_id: string;

  @IsUUID()
  doctor_id: string;

  @IsString()
  doctor_nombre: string;

  @IsString()
  comentario: string;

  @IsOptional()
  @IsString()
  recomendaciones?: string;

  @IsOptional()
  @IsBoolean()
  es_confidencial?: boolean;
}
