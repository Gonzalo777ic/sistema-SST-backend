import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspeccion } from './entities/inspeccion.entity';
import { HallazgoInspeccion } from './entities/hallazgo-inspeccion.entity';
import { InspeccionesController } from './inspecciones.controller';
import { InspeccionesService } from './inspecciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inspeccion, HallazgoInspeccion])],
  controllers: [InspeccionesController],
  providers: [InspeccionesService],
  exports: [InspeccionesService],
})
export class InspeccionesModule {}
