import { PartialType } from '@nestjs/mapped-types';
import { CreateExamenMedicoDto } from './create-examen-medico.dto';

export class UpdateExamenMedicoDto extends PartialType(CreateExamenMedicoDto) {}
