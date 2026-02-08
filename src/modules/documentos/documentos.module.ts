import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoSST } from './entities/documento-sst.entity';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoSST])],
  controllers: [DocumentosController],
  providers: [DocumentosService],
  exports: [DocumentosService],
})
export class DocumentosModule {}
