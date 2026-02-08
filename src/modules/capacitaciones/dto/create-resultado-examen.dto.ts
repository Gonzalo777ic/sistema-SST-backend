import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RespuestaDto {
  @IsInt()
  @Min(0)
  pregunta_index: number;

  @IsInt()
  @Min(0)
  respuesta_seleccionada: number;
}

export class CreateResultadoExamenDto {
  @IsUUID()
  examen_id: string;

  @IsUUID()
  trabajador_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaDto)
  respuestas: RespuestaDto[];
}
