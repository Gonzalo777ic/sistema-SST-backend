import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { AreasModule } from './modules/areas/areas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { TrabajadoresModule } from './modules/trabajadores/trabajadores.module';
import { AntecedentesOcupacionalesModule } from './modules/antecedentes-ocupacionales/antecedentes-ocupacionales.module';
import { SaludTrabajadorModule } from './modules/salud-trabajador/salud-trabajador.module';
import { AtsModule } from './modules/ats/ats.module';
import { PetarModule } from './modules/petar/petar.module';
import { IpercModule } from './modules/iperc/iperc.module';
import { IncidentesModule } from './modules/incidentes/incidentes.module';
import { SaludModule } from './modules/salud/salud.module';
import { DocumentosModule } from './modules/documentos/documentos.module';
import { EppModule } from './modules/epp/epp.module';
import { ConfigEppModule } from './modules/config-epp/config-epp.module';
import { ConfigCapacitacionesModule } from './modules/config-capacitaciones/config-capacitaciones.module';
import { ConfigEmoModule } from './modules/config-emo/config-emo.module';
import { UsuarioCentroMedicoModule } from './modules/usuario-centro-medico/usuario-centro-medico.module';
import { CapacitacionesModule } from './modules/capacitaciones/capacitaciones.module';
import { InspeccionesModule } from './modules/inspecciones/inspecciones.module';
import { PetsModule } from './modules/pets/pets.module';
import { ContratistasModule } from './modules/contratistas/contratistas.module';
import { RiesgosModule } from './modules/riesgos/riesgos.module';
import { PermisosModule } from './modules/permisos/permisos.module';
import { ComitesModule } from './modules/comites/comites.module';
import { AccionesCorrectivasModule } from './modules/acciones-correctivas/acciones-correctivas.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { Cie10Module } from './modules/cie10/cie10.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CommonModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'sst_user',
      password: process.env.DB_PASSWORD || 'sst_password',
      database: process.env.DB_DATABASE || 'sst_db',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    EmpresasModule,
    AreasModule,
    UsuariosModule,
    TrabajadoresModule,
    AntecedentesOcupacionalesModule,
    SaludTrabajadorModule,
    AuthModule,
    AtsModule,
    PetarModule,
    IpercModule,
    IncidentesModule,
    SaludModule,
    DocumentosModule,
    EppModule,
    ConfigEppModule,
    ConfigCapacitacionesModule,
    ConfigEmoModule,
    UsuarioCentroMedicoModule,
    CapacitacionesModule,
    InspeccionesModule,
    PetsModule,
    ContratistasModule,
    RiesgosModule,
    PermisosModule,
    ComitesModule,
    AccionesCorrectivasModule,
    ReportesModule,
    AuditoriaModule,
    Cie10Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
