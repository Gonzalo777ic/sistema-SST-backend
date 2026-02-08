import { PartialType } from '@nestjs/mapped-types';
import { CreateIpercDto } from './create-iperc.dto';

export class UpdateIpercDto extends PartialType(CreateIpercDto) {}
