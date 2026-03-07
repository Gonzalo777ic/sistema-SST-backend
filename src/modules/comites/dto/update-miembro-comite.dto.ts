import { IsEnum, IsOptional } from 'class-validator';
import {
  TipoMiembro,
  RolComite,
  Representacion,
} from '../entities/miembro-comite.entity';

export class UpdateMiembroComiteDto {
  @IsOptional()
  @IsEnum(TipoMiembro)
  tipo_miembro?: TipoMiembro;

  @IsOptional()
  @IsEnum(RolComite)
  rol_comite?: RolComite;

  @IsOptional()
  @IsEnum(Representacion)
  representacion?: Representacion;
}
