import { PartialType } from '@nestjs/mapped-types';
import { CreatePermisoTrabajoDto } from './create-permiso-trabajo.dto';

export class UpdatePermisoTrabajoDto extends PartialType(CreatePermisoTrabajoDto) {}
