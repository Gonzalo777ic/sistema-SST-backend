import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capacitacion } from './entities/capacitacion.entity';
import { AsistenciaCapacitacion } from './entities/asistencia-capacitacion.entity';
import { ExamenCapacitacion } from './entities/examen-capacitacion.entity';
import { ResultadoExamen } from './entities/resultado-examen.entity';
import { CertificadoCapacitacion } from './entities/certificado-capacitacion.entity';
import { CapacitacionesController } from './capacitaciones.controller';
import { CapacitacionesService } from './capacitaciones.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Capacitacion,
      AsistenciaCapacitacion,
      ExamenCapacitacion,
      ResultadoExamen,
      CertificadoCapacitacion,
    ]),
    TrabajadoresModule,
  ],
  controllers: [CapacitacionesController],
  providers: [CapacitacionesService],
  exports: [CapacitacionesService],
})
export class CapacitacionesModule {}
