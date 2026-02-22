import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoHabitoNocivo } from '../entities/habito-nocivo.entity';

export class UpsertHabitoNocivoItemDto {
  @IsOptional()
  id?: string;

  @IsEnum(TipoHabitoNocivo)
  tipo: TipoHabitoNocivo;

  @IsOptional()
  @IsString()
  cantidad?: string;

  @IsOptional()
  @IsString()
  frecuencia?: string;
}
