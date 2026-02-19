import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSedeDto } from './create-sede.dto';

export class UpdateSedeDto extends PartialType(OmitType(CreateSedeDto, ['empresa_id'] as const)) {}
