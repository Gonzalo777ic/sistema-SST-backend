import { PartialType } from '@nestjs/mapped-types';
import { CreatePetarDto } from './create-petar.dto';

export class UpdatePetarDto extends PartialType(CreatePetarDto) {}
