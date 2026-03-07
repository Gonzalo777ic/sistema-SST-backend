import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateMarcoNormativoDto {
  @IsUUID()
  empresa_id: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
