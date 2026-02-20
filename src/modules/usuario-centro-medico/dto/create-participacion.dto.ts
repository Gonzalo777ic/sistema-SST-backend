import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateParticipacionDto {
  @IsUUID()
  usuario_id: string;

  @IsUUID()
  centro_medico_id: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;
}
