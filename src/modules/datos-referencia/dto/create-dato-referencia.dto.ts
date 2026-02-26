import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, MinLength } from 'class-validator';
import { TipoDatoReferencia } from '../entities/dato-referencia.entity';

export class CreateDatoReferenciaDto {
  @IsEnum(TipoDatoReferencia)
  tipo: TipoDatoReferencia;

  @IsString()
  @MinLength(1, { message: 'El valor es obligatorio' })
  valor: string;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
