import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigCapacitacion } from './entities/config-capacitacion.entity';
import { ConfigCapacitacionesService } from './config-capacitaciones.service';
import { ConfigCapacitacionesController } from './config-capacitaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigCapacitacion])],
  controllers: [ConfigCapacitacionesController],
  providers: [ConfigCapacitacionesService],
  exports: [ConfigCapacitacionesService],
})
export class ConfigCapacitacionesModule {}
