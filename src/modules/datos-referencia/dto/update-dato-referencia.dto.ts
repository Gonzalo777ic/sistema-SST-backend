import { PartialType } from '@nestjs/mapped-types';
import { CreateDatoReferenciaDto } from './create-dato-referencia.dto';

export class UpdateDatoReferenciaDto extends PartialType(CreateDatoReferenciaDto) {}
