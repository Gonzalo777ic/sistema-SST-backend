import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contratista } from './entities/contratista.entity';
import { DocumentoContratista } from './entities/documento-contratista.entity';
import { ContratistasController } from './contratistas.controller';
import { ContratistasService } from './contratistas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contratista, DocumentoContratista])],
  controllers: [ContratistasController],
  providers: [ContratistasService],
  exports: [ContratistasService],
})
export class ContratistasModule {}
