import { IsEnum, IsOptional } from 'class-validator';
import { EstadoDifusion } from '../entities/difusion-documento.entity';

export class UpdateDifusionDocumentoDto {
  @IsEnum(EstadoDifusion)
  @IsOptional()
  estado?: EstadoDifusion;
}
