import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';
import { IsOptional, IsUrl, Length, Matches } from 'class-validator';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {
  @IsOptional()
  @Length(11, 11)
  @Matches(/^\d{11}$/)
  ruc?: string;
}
