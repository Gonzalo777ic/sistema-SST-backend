/**
 * Seeder para poblar la tabla epp con EPPs genéricos.
 * Inserta solo los que no existan (por nombre + empresa_id null). No duplica.
 *
 * Ejecutar: npm run seed:epp
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource, IsNull } from 'typeorm';
import { EPP } from '../src/modules/epp/entities/epp.entity';
import { eppSeedData } from '../src/modules/epp/data/epp-seed.data';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'sst_user',
    password: process.env.DB_PASSWORD || 'sst_password',
    database: process.env.DB_DATABASE || 'sst_db',
    entities: [EPP],
    synchronize: false,
  });
  await ds.initialize();

  const repo = ds.getRepository(EPP);
  const existing = await repo.find({
    where: { empresaId: IsNull() },
    select: ['nombre'],
  });
  const existingNombres = new Set(existing.map((e) => e.nombre));

  const toInsert = eppSeedData.filter((item) => !existingNombres.has(item.nombre));
  if (toInsert.length === 0) {
    console.log(`EPPs genéricos del seed ya existen (${existing.length} registros). Nada que insertar.`);
    await ds.destroy();
    return;
  }

  const entities = toInsert.map((item) =>
    repo.create({
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

  await repo.save(entities);
  console.log(`Seeder completado: ${entities.length} EPPs genéricos insertados.`);
  await ds.destroy();
}

seed().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
