import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudEPP } from './entities/solicitud-epp.entity';
import { SolicitudEPPDetalle } from './entities/solicitud-epp-detalle.entity';
import { EPP } from './entities/epp.entity';
import { TrabajadorEppFavorito } from './entities/trabajador-epp-favorito.entity';
import { EppController } from './epp.controller';
import { EppService } from './epp.service';
import { EppPdfService } from './epp-pdf.service';
import { EppSeeder } from './epp.seeder';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ConfigEppModule } from '../config-epp/config-epp.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudEPP, SolicitudEPPDetalle, EPP, Trabajador, Empresa, TrabajadorEppFavorito]),
    ConfigEppModule,
    UsuariosModule,
  ],
  controllers: [EppController],
  providers: [EppService, EppPdfService, EppSeeder],
  exports: [EppService],
})
export class EppModule {}
