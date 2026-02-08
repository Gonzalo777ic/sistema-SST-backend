import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisoTrabajo } from './entities/permiso-trabajo.entity';
import { TrabajadorPermiso } from './entities/trabajador-permiso.entity';
import { PermisosController } from './permisos.controller';
import { PermisosService } from './permisos.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermisoTrabajo, TrabajadorPermiso]),
    TrabajadoresModule,
  ],
  controllers: [PermisosController],
  providers: [PermisosService],
  exports: [PermisosService],
})
export class PermisosModule {}
