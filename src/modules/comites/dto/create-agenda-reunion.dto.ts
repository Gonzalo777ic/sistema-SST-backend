import { IsString, IsInt, Min } from 'class-validator';

export class CreateAgendaReunionDto {
  @IsString()
  descripcion: string;

  @IsInt()
  @Min(0)
  orden: number;
}
