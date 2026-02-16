import { IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RespuestaEvaluacionDto {
  @IsInt()
  @Min(0)
  pregunta_index: number;

  @IsInt()
  @Min(0)
  respuesta_seleccionada: number;
}

export class EvaluarPasoDto {
  @IsString()
  paso_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaEvaluacionDto)
  respuestas: RespuestaEvaluacionDto[];
}
