import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoSST } from './entities/documento-sst.entity';
import { DifusionDocumento } from './entities/difusion-documento.entity';
import { DifusionFirma } from './entities/difusion-firma.entity';
import { DocumentosController } from './documentos.controller';
import { DifusionesController } from './difusiones.controller';
import { DocumentosService } from './documentos.service';
import { DifusionesService } from './difusiones.service';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentoSST,
      DifusionDocumento,
      DifusionFirma,
      Trabajador,
    ]),
  ],
  controllers: [DocumentosController, DifusionesController],
  providers: [DocumentosService, DifusionesService],
  exports: [DocumentosService, DifusionesService],
})
export class DocumentosModule {}
