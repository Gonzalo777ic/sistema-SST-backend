import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePerfilEmoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  costo_unitario: number;
}
