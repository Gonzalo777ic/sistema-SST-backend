/**
 * Crea marcos predeterminados para todas las empresas que aún no los tienen.
 * Ejecutar una vez después de habilitar la creación automática al crear empresa.
 *
 * Uso: npm run seed:marcos-empresas-existentes
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MarcosNormativosService } from '../src/modules/marcos-normativos/marcos-normativos.service';
import { EmpresasService } from '../src/modules/empresas/empresas.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const marcosService = app.get(MarcosNormativosService);
  const empresasService = app.get(EmpresasService);

  const empresas = await empresasService.findAll();

  let count = 0;
  for (const emp of empresas) {
    try {
      await marcosService.crearMarcosPredeterminados(emp.id);
      count++;
      console.log(`Marcos creados para: ${emp.nombre}`);
    } catch (e: any) {
      console.warn(`Omitido ${emp.nombre}: ${e.message}`);
    }
  }

  console.log(`Completado. ${count} empresa(s) procesada(s).`);
  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
