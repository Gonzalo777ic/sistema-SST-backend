import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudEppDto } from './create-solicitud-epp.dto';
import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
  IsUrl,
} from 'class-validator';
import { EstadoSolicitudEPP } from '../entities/solicitud-epp.entity';

export class UpdateSolicitudEppDto extends PartialType(CreateSolicitudEppDto) {
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
  estado?: EstadoSolicitudEPP;
}
