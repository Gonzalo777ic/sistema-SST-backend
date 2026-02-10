import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Capacitacion } from '../capacitaciones/entities/capacitacion.entity';
import { AsistenciaCapacitacion } from '../capacitaciones/entities/asistencia-capacitacion.entity';
import { Incidente } from '../incidentes/entities/incidente.entity';
import { AccionCorrectiva } from '../acciones-correctivas/entities/accion-correctiva.entity';
import { Inspeccion } from '../inspecciones/entities/inspeccion.entity';
import { HallazgoInspeccion } from '../inspecciones/entities/hallazgo-inspeccion.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { Area } from '../empresas/entities/area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Capacitacion,
      AsistenciaCapacitacion,
      Incidente,
      AccionCorrectiva,
      Inspeccion,
      HallazgoInspeccion,
      Trabajador,
      Area,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
