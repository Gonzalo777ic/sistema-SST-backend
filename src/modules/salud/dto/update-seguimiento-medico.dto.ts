import { PartialType } from '@nestjs/mapped-types';
import { CreateSeguimientoMedicoDto } from './create-seguimiento-medico.dto';

export class UpdateSeguimientoMedicoDto extends PartialType(CreateSeguimientoMedicoDto) {}
