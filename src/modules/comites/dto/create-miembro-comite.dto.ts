import {
  IsUUID,
  IsEnum,
} from 'class-validator';
import {
  TipoMiembro,
  RolComite,
  Representacion,
} from '../entities/miembro-comite.entity';

export class CreateMiembroComiteDto {
  @IsUUID()
  trabajador_id: string;

  @IsEnum(TipoMiembro)
  tipo_miembro: TipoMiembro;

  @IsEnum(RolComite)
  rol_comite: RolComite;

  @IsEnum(Representacion)
  representacion: Representacion;
}
