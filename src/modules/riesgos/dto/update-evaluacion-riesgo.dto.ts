import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluacionRiesgoDto } from './create-evaluacion-riesgo.dto';

export class UpdateEvaluacionRiesgoDto extends PartialType(CreateEvaluacionRiesgoDto) {}
