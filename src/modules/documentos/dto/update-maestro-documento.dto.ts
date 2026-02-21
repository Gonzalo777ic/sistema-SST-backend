import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMaestroDocumentoDto } from './create-maestro-documento.dto';

export class UpdateMaestroDocumentoDto extends PartialType(
  OmitType(CreateMaestroDocumentoDto, ['empresa_id'] as const),
) {}
