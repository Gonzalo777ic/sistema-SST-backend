import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PETAR } from './entities/petar.entity';
import { PetarTrabajador } from './entities/petar-trabajador.entity';
import { PetarController } from './petar.controller';
import { PetarService } from './petar.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PETAR, PetarTrabajador]),
    TrabajadoresModule,
  ],
  controllers: [PetarController],
  providers: [PetarService],
  exports: [PetarService],
})
export class PetarModule {}
