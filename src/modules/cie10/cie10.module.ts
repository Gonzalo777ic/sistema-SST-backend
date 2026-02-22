import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cie10 } from './entities/cie10.entity';
import { Cie10Service } from './cie10.service';
import { Cie10Controller } from './cie10.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cie10])],
  controllers: [Cie10Controller],
  providers: [Cie10Service],
  exports: [Cie10Service],
})
export class Cie10Module {}
