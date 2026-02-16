import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Area } from './entities/area.entity';
import { FirmaGerente } from './entities/firma-gerente.entity';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { FirmasGerenteService } from './firmas-gerente.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, Area, FirmaGerente, Usuario, Trabajador]),
  ],
  controllers: [EmpresasController],
  providers: [EmpresasService, FirmasGerenteService],
  exports: [TypeOrmModule, EmpresasService, FirmasGerenteService],
})
export class EmpresasModule {}
