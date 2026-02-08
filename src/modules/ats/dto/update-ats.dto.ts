import { PartialType } from '@nestjs/mapped-types';
import { CreateAtsDto } from './create-ats.dto';

export class UpdateAtsDto extends PartialType(CreateAtsDto) {}
