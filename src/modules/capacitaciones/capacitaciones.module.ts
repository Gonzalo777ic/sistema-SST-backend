import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capacitacion } from './entities/capacitacion.entity';
import { AsistenciaCapacitacion } from './entities/asistencia-capacitacion.entity';
import { ExamenCapacitacion } from './entities/examen-capacitacion.entity';
import { ResultadoExamen } from './entities/resultado-examen.entity';
import { ResultadoEvaluacionPaso } from './entities/resultado-evaluacion-paso.entity';
import { CertificadoCapacitacion } from './entities/certificado-capacitacion.entity';
import { AdjuntoCapacitacion } from './entities/adjunto-capacitacion.entity';
import { EvaluacionFavorita } from './entities/evaluacion-favorita.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CapacitacionesController } from './capacitaciones.controller';
import { CapacitacionesService } from './capacitaciones.service';
import { CertificadoCapacitacionPdfService } from './certificado-capacitacion-pdf.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';
import { ConfigCapacitacionesModule } from '../config-capacitaciones/config-capacitaciones.module';
import { EmpresasModule } from '../empresas/empresas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Capacitacion,
      AsistenciaCapacitacion,
      ExamenCapacitacion,
      ResultadoExamen,
      ResultadoEvaluacionPaso,
      CertificadoCapacitacion,
      AdjuntoCapacitacion,
      EvaluacionFavorita,
      Empresa,
    ]),
    TrabajadoresModule,
    ConfigCapacitacionesModule,
    EmpresasModule,
  ],
  controllers: [CapacitacionesController],
  providers: [CapacitacionesService, CertificadoCapacitacionPdfService],
  exports: [CapacitacionesService],
})
export class CapacitacionesModule {}
