import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPERC } from './entities/iperc.entity';
import { LineaIPERC } from './entities/linea-iperc.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { IpercController } from './iperc.controller';
import { IpercService } from './iperc.service';

@Module({
  imports: [TypeOrmModule.forFeature([IPERC, LineaIPERC, Empresa])],
  controllers: [IpercController],
  providers: [IpercService],
  exports: [IpercService],
})
export class IpercModule {}
