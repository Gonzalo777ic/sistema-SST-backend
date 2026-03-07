import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { EstadoReunion, TipoReunion } from '../entities/reunion-comite.entity';

export class CreateReunionComiteDto {
  @IsUUID(undefined, { message: 'Debe seleccionar un comité' })
  comite_id: string;

  @IsString()
  sesion: string;

  @IsDateString()
  fecha_realizacion: string;

  @IsOptional()
  @IsString()
  hora_registro?: string; // Formato HH:mm

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
  agenda?: string[]; // Array de textos para la agenda
}
