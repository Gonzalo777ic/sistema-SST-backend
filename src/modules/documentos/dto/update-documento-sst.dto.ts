import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoSstDto } from './create-documento-sst.dto';

export class UpdateDocumentoSstDto extends PartialType(CreateDocumentoSstDto) {}
