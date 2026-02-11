import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoSolicitudEPP } from '../entities/solicitud-epp.entity';

export class CreateSolicitudEppDetalleDto {
  @IsUUID()
  epp_id: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateSolicitudEppDto {
  @IsUUID()
  usuario_epp_id: string;

  @IsUUID()
  solicitante_id: string;

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

  @IsUUID()
  empresa_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSolicitudEppDetalleDto)
  detalles: CreateSolicitudEppDetalleDto[];

  @IsOptional()
  estado?: EstadoSolicitudEPP;
}
