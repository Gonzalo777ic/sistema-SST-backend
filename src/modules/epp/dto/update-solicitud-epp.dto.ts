import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
  IsUrl,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoSolicitudEPP } from '../entities/solicitud-epp.entity';
import { CreateSolicitudEppDetalleDto } from './create-solicitud-epp.dto';

export class UpdateSolicitudEppDto {
  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  centro_costos?: string;

  @IsOptional()
  @IsString()
  comentarios?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsOptional()
  @IsUUID()
  supervisor_aprobador_id?: string;

  @IsOptional()
  @IsDateString()
  fecha_aprobacion?: string;

  @IsOptional()
  @IsString()
  comentarios_aprobacion?: string;

  @IsOptional()
  @IsUUID()
  entregado_por_id?: string;

  @IsOptional()
  @IsDateString()
  fecha_entrega?: string;

  @IsOptional()
  @IsUrl()
  firma_recepcion_url?: string;

  @IsOptional()
  @IsEnum(EstadoSolicitudEPP)
  estado?: EstadoSolicitudEPP;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSolicitudEppDetalleDto)
  detalles?: CreateSolicitudEppDetalleDto[];
}
