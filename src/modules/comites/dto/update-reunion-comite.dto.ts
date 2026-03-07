import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { EstadoReunion, TipoReunion } from '../entities/reunion-comite.entity';

export class UpdateReunionComiteDto {
  @IsOptional()
  @IsString()
  sesion?: string;

  @IsOptional()
  @IsDateString()
  fecha_realizacion?: string;

  @IsOptional()
  @IsString()
  hora_registro?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(EstadoReunion)
  estado?: EstadoReunion;

  @IsOptional()
  @IsEnum(TipoReunion)
  tipo_reunion?: TipoReunion;

  @IsOptional()
  @IsBoolean()
  enviar_alerta?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agenda?: string[];

  @IsOptional()
  @IsString()
  numero_reunion?: string;

  @IsOptional()
  @IsString()
  proxima_reunion?: string;

  @IsOptional()
  @IsString()
  duracion?: string; // HH:mm

  @IsOptional()
  @IsString()
  desarrollo?: string;

  @IsOptional()
  @IsBoolean()
  acuerdo_informativo?: boolean;

  @IsOptional()
  @IsString()
  acuerdo_informativo_texto?: string;
}
