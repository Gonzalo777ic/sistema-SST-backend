import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PreguntaDto {
  @IsString()
  texto_pregunta: string;

  @IsString()
  tipo: 'OpcionMultiple' | 'VerdaderoFalso';

  @IsArray()
  @IsString({ each: true })
  opciones: string[];

  @IsInt()
  @Min(0)
  respuesta_correcta_index: number;

  @IsInt()
  @Min(1)
  puntaje: number;
}

export class CreateExamenCapacitacionDto {
  @IsUUID()
  capacitacion_id: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duracion_minutos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  puntaje_minimo_aprobacion?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreguntaDto)
  preguntas: PreguntaDto[];
}
