import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateGerenciaDto } from './create-gerencia.dto';

export class UpdateGerenciaDto extends PartialType(OmitType(CreateGerenciaDto, ['empresa_id'] as const)) {}
