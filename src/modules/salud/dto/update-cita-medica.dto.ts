import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaMedicaDto } from './create-cita-medica.dto';

export class UpdateCitaMedicaDto extends PartialType(CreateCitaMedicaDto) {}
