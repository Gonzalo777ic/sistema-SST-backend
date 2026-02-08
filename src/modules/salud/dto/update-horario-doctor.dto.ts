import { PartialType } from '@nestjs/mapped-types';
import { CreateHorarioDoctorDto } from './create-horario-doctor.dto';

export class UpdateHorarioDoctorDto extends PartialType(CreateHorarioDoctorDto) {}
