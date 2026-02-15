import { IsString, IsArray, ValidateNested, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class PreguntaFavoritaDto {
  @IsString()
  texto_pregunta: string;

  @IsString()
  tipo: 'OpcionMultiple' | 'VerdaderoFalso';

  @IsArray()
  @IsString({ each: true })
  opciones: string[];

  @IsNumber()
  @Min(0)
  respuesta_correcta_index: number;

  @IsNumber()
  @Min(1)
  puntaje: number;
}

export class CreateEvaluacionFavoritaDto {
  @IsString()
  nombre: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreguntaFavoritaDto)
  preguntas: PreguntaFavoritaDto[];

  @IsOptional()
  @IsUUID()
  empresa_id?: string;
}
