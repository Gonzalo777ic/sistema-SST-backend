import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { AdminSeederService } from './admin-seeder.service';
import { EmpresasModule } from '../empresas/empresas.module';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CentroMedico } from '../config-emo/entities/centro-medico.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Trabajador, Empresa, CentroMedico]),
    EmpresasModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService, AdminSeederService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
