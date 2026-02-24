import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
