import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilEmo } from './entities/perfil-emo.entity';
import { CentroMedico } from './entities/centro-medico.entity';
import { ResultadoAdicionalEmo } from './entities/resultado-adicional-emo.entity';
import { ConfigEmo } from './entities/config-emo.entity';
import { EmoDiferido } from './entities/emo-diferido.entity';
import { ConfigEmoController } from './config-emo.controller';
import { ConfigEmoService } from './config-emo.service';
import { CommonModule } from '../../common/common.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { UsuarioCentroMedicoModule } from '../usuario-centro-medico/usuario-centro-medico.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerfilEmo,
      CentroMedico,
      ResultadoAdicionalEmo,
      ConfigEmo,
      EmoDiferido,
    ]),
    CommonModule,
    UsuariosModule,
    UsuarioCentroMedicoModule,
  ],
  controllers: [ConfigEmoController],
  providers: [ConfigEmoService],
  exports: [ConfigEmoService],
})
export class ConfigEmoModule {}
