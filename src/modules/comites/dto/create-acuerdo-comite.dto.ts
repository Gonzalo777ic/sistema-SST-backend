import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { TipoAcuerdo, EstadoAcuerdo } from '../entities/acuerdo-comite.entity';

export class CreateAcuerdoComiteDto {
  @IsUUID()
  reunion_id: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoAcuerdo)
  tipo_acuerdo?: TipoAcuerdo;

  @IsOptional()
  @IsDateString()
  fecha_programada?: string;

  @IsOptional()
  @IsDateString()
  fecha_real?: string;

  @IsOptional()
  @IsEnum(EstadoAcuerdo)
  estado?: EstadoAcuerdo;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe asignar al menos un responsable' })
  @IsUUID(undefined, { each: true })
  responsables_ids: string[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
