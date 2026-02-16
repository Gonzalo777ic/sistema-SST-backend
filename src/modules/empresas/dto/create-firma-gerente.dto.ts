import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateFirmaGerenteDto {
  @IsUUID()
  empresa_id: string;

  /** Usuario (ADMIN/SUPER_ADMIN) - requerido si no es trabajador */
  @IsOptional()
  @IsUUID()
  usuario_id?: string | null;

  /** Trabajador - requerido si no es usuario */
  @IsOptional()
  @IsUUID()
  trabajador_id?: string | null;

  @IsString()
  nombre_completo: string;

  @IsString()
  numero_documento: string;

  @IsString()
  @IsOptional()
  tipo_documento?: string;

  @IsString()
  rol: string;

  @IsString()
  cargo: string;

  /** Base64 de imagen (data:image/...) o null para usar firma existente del usuario/trabajador */
  @IsOptional()
  firma_base64?: string | null;
}
