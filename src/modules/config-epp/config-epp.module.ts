import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEPP } from './entities/config-epp.entity';
import { ConfigEppService } from './config-epp.service';
import { ConfigEppController } from './config-epp.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigEPP])],
  controllers: [ConfigEppController],
  providers: [ConfigEppService],
  exports: [ConfigEppService],
})
export class ConfigEppModule {}
