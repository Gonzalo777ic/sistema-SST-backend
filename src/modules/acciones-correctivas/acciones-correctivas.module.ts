import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccionCorrectiva } from './entities/accion-correctiva.entity';
import { AccionesCorrectivasController } from './acciones-correctivas.controller';
import { AccionesCorrectivasService } from './acciones-correctivas.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccionCorrectiva])],
  controllers: [AccionesCorrectivasController],
  providers: [AccionesCorrectivasService],
  exports: [AccionesCorrectivasService],
})
export class AccionesCorrectivasModule {}
