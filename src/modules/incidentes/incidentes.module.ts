import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incidente } from './entities/incidente.entity';
import { IncidentesController } from './incidentes.controller';
import { IncidentesService } from './incidentes.service';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incidente, Trabajador]),
  ],
  controllers: [IncidentesController],
  providers: [IncidentesService],
  exports: [IncidentesService],
})
export class IncidentesModule {}
