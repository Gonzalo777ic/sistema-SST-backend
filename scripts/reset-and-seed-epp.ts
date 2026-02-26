/**
 * Desactiva (soft delete) todos los EPPs genéricos y luego los recrea desde el seed.
 * Útil para refrescar los datos del seed con las últimas imágenes y descripciones.
 *
 * Ejecutar: npm run seed:epp:reset
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';
import { eppSeedData } from '../src/modules/epp/data/epp-seed.data';

async function resetAndSeed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'sst_user',
    password: process.env.DB_PASSWORD || 'sst_password',
    database: process.env.DB_DATABASE || 'sst_db',
  });
  await client.connect();

  try {
    // 1. Soft-delete de todos los EPPs genéricos
    const delResult = await client.query(
      `UPDATE epp SET deleted_at = NOW() WHERE empresa_id IS NULL AND deleted_at IS NULL`,
    );
    console.log(`EPPs genéricos desactivados: ${delResult.rowCount ?? 0}`);

    // 2. Insertar todos desde el seed
    for (const item of eppSeedData) {
      await client.query(
        `INSERT INTO epp (nombre, descripcion, tipo_proteccion, categoria, vigencia, imagen_url, adjunto_pdf_url, categoria_criticidad, costo, empresa_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL)`,
        [
          item.nombre,
          item.descripcion,
          item.tipoProteccion,
          item.categoria,
          item.vigencia,
          item.imagen_url?.trim() || null,
          item.adjunto_pdf_url?.trim() || null,
          item.categoriaCriticidad ?? null,
        ],
      );
    }
    console.log(`Seeder completado: ${eppSeedData.length} EPPs genéricos insertados.`);
  } finally {
    await client.end();
  }
}

resetAndSeed().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
