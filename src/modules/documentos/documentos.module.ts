import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoSST } from './entities/documento-sst.entity';
import { DifusionDocumento } from './entities/difusion-documento.entity';
import { DifusionFirma } from './entities/difusion-firma.entity';
import { MaestroDocumento } from './entities/maestro-documento.entity';
import { DocumentosController } from './documentos.controller';
import { DifusionesController } from './difusiones.controller';
import { MaestroDocumentosController } from './maestro-documentos.controller';
import { DocumentosService } from './documentos.service';
import { DifusionesService } from './difusiones.service';
import { MaestroDocumentosService } from './maestro-documentos.service';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentoSST,
      DifusionDocumento,
      DifusionFirma,
      MaestroDocumento,
      Trabajador,
    ]),
  ],
  controllers: [DocumentosController, DifusionesController, MaestroDocumentosController],
  providers: [DocumentosService, DifusionesService, MaestroDocumentosService],
  exports: [DocumentosService, DifusionesService, MaestroDocumentosService],
})
export class DocumentosModule {}
