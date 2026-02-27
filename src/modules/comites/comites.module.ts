import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comite } from './entities/comite.entity';
import { MiembroComite } from './entities/miembro-comite.entity';
import { DocumentoComite } from './entities/documento-comite.entity';
import { ReunionComite } from './entities/reunion-comite.entity';
import { AcuerdoComite } from './entities/acuerdo-comite.entity';
import { AgendaReunion } from './entities/agenda-reunion.entity';
import { AcuerdoResponsable } from './entities/acuerdo-responsable.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ComitesController } from './comites.controller';
import { ComitesService } from './comites.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comite,
      MiembroComite,
      DocumentoComite,
      ReunionComite,
      AcuerdoComite,
      AgendaReunion,
      AcuerdoResponsable,
      Trabajador,
      Empresa,
    ]),
    UsuariosModule,
  ],
  controllers: [ComitesController],
  providers: [ComitesService],
  exports: [ComitesService],
})
export class ComitesModule {}
