import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatoReferencia } from './entities/dato-referencia.entity';
import { DatosReferenciaService } from './datos-referencia.service';
import { DatosReferenciaController } from './datos-referencia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DatoReferencia])],
  controllers: [DatosReferenciaController],
  providers: [DatosReferenciaService],
  exports: [DatosReferenciaService],
})
export class DatosReferenciaModule {}
