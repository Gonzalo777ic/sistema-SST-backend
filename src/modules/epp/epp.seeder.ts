import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { EPP } from './entities/epp.entity';
import { eppSeedData } from './data/epp-seed.data';

@Injectable()
export class EppSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(EppSeeder.name);

  constructor(
    @InjectRepository(EPP)
    private readonly eppRepository: Repository<EPP>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  private async seed(): Promise<void> {
    try {
      const existing = await this.eppRepository.find({
        where: { empresaId: IsNull() },
        select: ['nombre'],
      });
      const existingNombres = new Set(existing.map((e) => e.nombre));

      const toInsert = eppSeedData.filter((item) => !existingNombres.has(item.nombre));
      if (toInsert.length === 0) {
        this.logger.log(
          `EPPs genéricos del seed ya existen (${existing.length} registros). Nada que insertar.`,
        );
        return;
      }

      const entities = toInsert.map((item) =>
        this.eppRepository.create({
          nombre: item.nombre,
          descripcion: item.descripcion,
          tipoProteccion: item.tipoProteccion,
          categoria: item.categoria,
          vigencia: item.vigencia,
          imagenUrl: item.imagen_url?.trim() || null,
          adjuntoPdfUrl: item.adjunto_pdf_url?.trim() || null,
          categoriaCriticidad: item.categoriaCriticidad ?? null,
          costo: null,
          empresaId: null,
        }),
      );

      await this.eppRepository.save(entities);
      this.logger.log(
        `Seed de EPPs: ${entities.length} registros genéricos insertados (${existing.length} ya existían).`,
      );
    } catch (error) {
      this.logger.error(
        `Error en seed de EPPs: ${error.message}`,
        error.stack,
      );
    }
  }
}
