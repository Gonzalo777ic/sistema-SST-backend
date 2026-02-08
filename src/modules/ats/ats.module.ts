import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ATS } from './entities/ats.entity';
import { Area } from '../empresas/entities/area.entity';
import { AtsPersonalInvolucrado } from './entities/ats-personal-involucrado.entity';
import { AtsPasoTrabajo } from './entities/ats-paso-trabajo.entity';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ATS, Area, AtsPersonalInvolucrado, AtsPasoTrabajo]),
  ],
  controllers: [AtsController],
  providers: [AtsService],
  exports: [AtsService],
})
export class AtsModule {}
