import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntecedenteOcupacional } from './entities/antecedente-ocupacional.entity';
import { AntecedentesOcupacionalesController } from './antecedentes-ocupacionales.controller';
import { AntecedentesOcupacionalesService } from './antecedentes-ocupacionales.service';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AntecedenteOcupacional]),
    TrabajadoresModule,
  ],
  controllers: [AntecedentesOcupacionalesController],
  providers: [AntecedentesOcupacionalesService],
  exports: [AntecedentesOcupacionalesService],
})
export class AntecedentesOcupacionalesModule {}
