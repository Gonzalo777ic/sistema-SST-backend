import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PETS } from './entities/pets.entity';
import { PetsPaso } from './entities/pets-paso.entity';
import { PetsLectura } from './entities/pets-lectura.entity';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([PETS, PetsPaso, PetsLectura])],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
