import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePerfilEmoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costo_unitario?: number;
}
