import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamenMedico } from './entities/examen-medico.entity';
import { CitaMedica } from './entities/cita-medica.entity';
import { ComentarioMedico } from './entities/comentario-medico.entity';
import { HorarioDoctor } from './entities/horario-doctor.entity';
import { SaludController } from './salud.controller';
import { SaludService } from './salud.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExamenMedico, CitaMedica, ComentarioMedico, HorarioDoctor]),
  ],
  controllers: [SaludController],
  providers: [SaludService],
  exports: [SaludService],
})
export class SaludModule {}
