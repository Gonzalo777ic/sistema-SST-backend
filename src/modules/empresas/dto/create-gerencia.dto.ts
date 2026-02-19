import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateGerenciaDto {
  @IsString({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsUUID('all', { message: 'La empresa es obligatoria' })
  empresa_id: string;
}
