import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incidente } from './entities/incidente.entity';
import { IncidentesController } from './incidentes.controller';
import { IncidentesService } from './incidentes.service';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { AccionCorrectiva } from '../acciones-correctivas/entities/accion-correctiva.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incidente, Trabajador, AccionCorrectiva]),
  ],
  controllers: [IncidentesController],
  providers: [IncidentesService],
  exports: [IncidentesService],
})
export class IncidentesModule {}
