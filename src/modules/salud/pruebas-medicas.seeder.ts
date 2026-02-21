import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PruebaMedica } from './entities/prueba-medica.entity';

const PRUEBAS_INICIALES = [
  'Laboratorio Clínico',
  'Audiometría',
  'Oftalmología / Optometría',
  'Espirometría',
  'Radiografía de Tórax (Rx)',
  'Electrocardiograma (EKG)',
  'Psicología Ocupacional',
  'Odontología',
  'Triaje / Somatometría',
  'Examen Físico General',
  'Prueba de Altura Estructural',
  'Otros / Adicionales',
];

@Injectable()
export class PruebasMedicasSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(PruebasMedicasSeeder.name);

  constructor(
    @InjectRepository(PruebaMedica)
    private readonly pruebaMedicaRepository: Repository<PruebaMedica>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  private async seed(): Promise<void> {
    try {
      const count = await this.pruebaMedicaRepository.count();
      if (count > 0) {
        this.logger.log('Pruebas médicas ya existen. Seed omitido.');
        return;
      }

      const entities = PRUEBAS_INICIALES.map((nombre) =>
        this.pruebaMedicaRepository.create({ nombre, activo: true }),
      );
      await this.pruebaMedicaRepository.save(entities);
      this.logger.log(
        `Seed de pruebas médicas completado: ${entities.length} registros.`,
      );
    } catch (error) {
      this.logger.error(
        `Error en seed de pruebas médicas: ${error.message}`,
        error.stack,
      );
    }
  }
}
