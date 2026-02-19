import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUnidadDto } from './create-unidad.dto';

export class UpdateUnidadDto extends PartialType(OmitType(CreateUnidadDto, ['empresa_id'] as const)) {}
