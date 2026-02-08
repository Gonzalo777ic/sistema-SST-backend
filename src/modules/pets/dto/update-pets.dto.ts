import { PartialType } from '@nestjs/mapped-types';
import { CreatePetsDto } from './create-pets.dto';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { EstadoPETS } from '../entities/pets.entity';

export class UpdatePetsDto extends PartialType(CreatePetsDto) {
  @IsOptional()
  @IsUUID()
  revisor_id?: string;

  @IsOptional()
  @IsUUID()
  aprobador_id?: string;

  @IsOptional()
  @IsEnum(EstadoPETS)
  estado?: EstadoPETS;
}
