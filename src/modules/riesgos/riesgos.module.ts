import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionRiesgo } from './entities/evaluacion-riesgo.entity';
import { MedidaControl } from './entities/medida-control.entity';
import { RiesgosController } from './riesgos.controller';
import { RiesgosService } from './riesgos.service';
import { IpercModule } from '../iperc/iperc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluacionRiesgo, MedidaControl]),
    IpercModule,
  ],
  controllers: [RiesgosController],
  providers: [RiesgosService],
  exports: [RiesgosService],
})
export class RiesgosModule {}
