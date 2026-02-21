import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePruebaMedicaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
