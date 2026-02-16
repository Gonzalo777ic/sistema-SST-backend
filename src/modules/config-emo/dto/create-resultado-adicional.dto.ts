import { IsString } from 'class-validator';

export class CreateResultadoAdicionalDto {
  @IsString()
  nombre: string;
}
