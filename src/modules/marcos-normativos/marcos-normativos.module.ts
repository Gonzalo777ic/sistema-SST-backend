import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcoNormativo } from './entities/marco-normativo.entity';
import { DocumentoNormativo } from './entities/documento-normativo.entity';
import { EmpresaMarcoNormativo } from './entities/empresa-marco-normativo.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { MarcosNormativosController } from './marcos-normativos.controller';
import { MarcosNormativosService } from './marcos-normativos.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarcoNormativo, DocumentoNormativo, EmpresaMarcoNormativo, Empresa]),
    CommonModule,
  ],
  controllers: [MarcosNormativosController],
  providers: [MarcosNormativosService],
  exports: [MarcosNormativosService],
})
export class MarcosNormativosModule {}
