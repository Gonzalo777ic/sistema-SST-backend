import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamenMedico } from './entities/examen-medico.entity';
import { DocumentoExamenMedico } from './entities/documento-examen-medico.entity';
import { CitaMedica } from './entities/cita-medica.entity';
import { ComentarioMedico } from './entities/comentario-medico.entity';
import { HorarioDoctor } from './entities/horario-doctor.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioCentroMedico } from '../usuario-centro-medico/entities/usuario-centro-medico.entity';
import { CentroMedico } from '../config-emo/entities/centro-medico.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { SaludController } from './salud.controller';
import { SaludService } from './salud.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExamenMedico,
      DocumentoExamenMedico,
      CitaMedica,
      ComentarioMedico,
      HorarioDoctor,
      Usuario,
      UsuarioCentroMedico,
      CentroMedico,
      Trabajador,
    ]),
    CommonModule,
  ],
  controllers: [SaludController],
  providers: [SaludService],
  exports: [SaludService],
})
export class SaludModule {}
