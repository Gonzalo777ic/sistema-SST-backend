import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePruebaMedicaDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(200)
  nombre: string;
}
