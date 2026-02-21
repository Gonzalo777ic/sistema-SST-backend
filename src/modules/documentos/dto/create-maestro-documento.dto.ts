import { IsString, IsUUID } from 'class-validator';

export class CreateMaestroDocumentoDto {
  @IsString()
  nombre: string;

  @IsString()
  proceso: string;

  @IsString()
  subproceso: string;

  @IsUUID()
  empresa_id: string;
}
