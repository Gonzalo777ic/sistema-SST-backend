import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './entities/trabajador.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TrabajadoresController } from './trabajadores.controller';
import { TrabajadoresService } from './trabajadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajador, Usuario])],
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService],
  exports: [TypeOrmModule, TrabajadoresService],
})
export class TrabajadoresModule {}
