import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaludTrabajador } from './entities/salud-trabajador.entity';
import { HabitoNocivo } from './entities/habito-nocivo.entity';
import { AusentismoMedico } from './entities/ausentismo-medico.entity';
import { SaludTrabajadorController } from './salud-trabajador.controller';
import { SugerenciasSaludController } from './sugerencias-salud.controller';
import { SaludTrabajadorService } from './salud-trabajador.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaludTrabajador, HabitoNocivo, AusentismoMedico]),
    TrabajadoresModule,
  ],
  controllers: [SaludTrabajadorController, SugerenciasSaludController],
  providers: [SaludTrabajadorService],
  exports: [SaludTrabajadorService],
})
export class SaludTrabajadorModule {}
