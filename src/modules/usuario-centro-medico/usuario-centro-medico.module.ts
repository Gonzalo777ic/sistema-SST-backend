import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioCentroMedico } from './entities/usuario-centro-medico.entity';
import { CentroMedico } from '../config-emo/entities/centro-medico.entity';
import { UsuarioCentroMedicoService } from './usuario-centro-medico.service';
import { UsuarioCentroMedicoController } from './usuario-centro-medico.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioCentroMedico, CentroMedico]),
    UsuariosModule,
  ],
  controllers: [UsuarioCentroMedicoController],
  providers: [UsuarioCentroMedicoService],
  exports: [UsuarioCentroMedicoService],
})
export class UsuarioCentroMedicoModule {}
