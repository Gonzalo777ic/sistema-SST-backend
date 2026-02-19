import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Area } from './entities/area.entity';
import { Unidad } from './entities/unidad.entity';
import { Sede } from './entities/sede.entity';
import { Gerencia } from './entities/gerencia.entity';
import { FirmaGerente } from './entities/firma-gerente.entity';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { FirmasGerenteService } from './firmas-gerente.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, Area, Unidad, Sede, Gerencia, FirmaGerente, Usuario, Trabajador]),
  ],
  controllers: [EmpresasController],
  providers: [EmpresasService, FirmasGerenteService],
  exports: [TypeOrmModule, EmpresasService, FirmasGerenteService],
})
export class EmpresasModule {}
