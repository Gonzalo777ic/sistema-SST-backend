import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudEPP } from './entities/solicitud-epp.entity';
import { EppController } from './epp.controller';
import { EppService } from './epp.service';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudEPP])],
  controllers: [EppController],
  providers: [EppService],
  exports: [EppService],
})
export class EppModule {}
