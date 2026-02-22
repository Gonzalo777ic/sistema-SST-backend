import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertAusentismoItemDto {
  @IsOptional()
  id?: string;

  @IsString()
  enfermedad_accidente: string;

  @IsBoolean()
  asociado_trabajo: boolean;

  @IsInt()
  @Min(1900)
  @Type(() => Number)
  anio: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  dias_descanso: number;
}
