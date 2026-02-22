import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaludTrabajador } from './entities/salud-trabajador.entity';
import { HabitoNocivo } from './entities/habito-nocivo.entity';
import { SaludTrabajadorController } from './salud-trabajador.controller';
import { SaludTrabajadorService } from './salud-trabajador.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaludTrabajador, HabitoNocivo]),
    TrabajadoresModule,
  ],
  controllers: [SaludTrabajadorController],
  providers: [SaludTrabajadorService],
  exports: [SaludTrabajadorService],
})
export class SaludTrabajadorModule {}
