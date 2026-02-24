import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateCargoDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
