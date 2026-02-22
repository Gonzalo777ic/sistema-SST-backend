import { PartialType } from '@nestjs/mapped-types';
import { CreateAntecedenteOcupacionalDto } from './create-antecedente-ocupacional.dto';

export class UpdateAntecedenteOcupacionalDto extends PartialType(CreateAntecedenteOcupacionalDto) {}
