import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudEPP } from './entities/solicitud-epp.entity';
import { SolicitudEPPDetalle } from './entities/solicitud-epp-detalle.entity';
import { EPP } from './entities/epp.entity';
import { EppController } from './epp.controller';
import { EppService } from './epp.service';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { ConfigEppModule } from '../config-epp/config-epp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudEPP, SolicitudEPPDetalle, EPP, Trabajador]),
    ConfigEppModule,
  ],
  controllers: [EppController],
  providers: [EppService],
  exports: [EppService],
})
export class EppModule {}
