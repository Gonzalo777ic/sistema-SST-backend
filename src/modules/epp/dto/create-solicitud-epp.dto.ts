import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsUrl,
} from 'class-validator';
import { TipoEPP, MotivoEPP, EstadoSolicitudEPP } from '../entities/solicitud-epp.entity';

export class CreateSolicitudEppDto {
  @IsEnum(TipoEPP)
  tipo_epp: TipoEPP;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsString()
  talla: string;

  @IsEnum(MotivoEPP)
  motivo: MotivoEPP;

  @IsOptional()
  @IsString()
  descripcion_motivo?: string;

  @IsUUID()
  trabajador_id: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsUUID()
  empresa_id: string;

  @IsOptional()
  @IsEnum(EstadoSolicitudEPP)
  estado?: EstadoSolicitudEPP;
}
