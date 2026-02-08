import { PartialType } from '@nestjs/mapped-types';
import { CreateComentarioMedicoDto } from './create-comentario-medico.dto';

export class UpdateComentarioMedicoDto extends PartialType(CreateComentarioMedicoDto) {}
