/**
 * Migración: agregar columna activo a documentos_normativos y eliminar deleted_at.
 * Ejecutar: npm run migrate:documentos-activo
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';

async function migrate() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'sst_user',
    password: process.env.DB_PASSWORD || 'sst_pass',
    database: process.env.DB_DATABASE || 'sst_db',
    synchronize: false,
  });

  await ds.initialize();

  try {
    const qr = ds.createQueryRunner();
    await qr.connect();

    // Verificar si existe la columna deleted_at
    const hasDeletedAt = await qr.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'documentos_normativos' AND column_name = 'deleted_at'
    `);

    // Verificar si existe la columna activo
    const hasActivo = await qr.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'documentos_normativos' AND column_name = 'activo'
    `);

    if (hasActivo.length === 0) {
      await qr.query(`
        ALTER TABLE documentos_normativos
        ADD COLUMN activo boolean NOT NULL DEFAULT true
      `);
      console.log('Columna activo agregada.');
    }

    if (hasDeletedAt.length > 0) {
      await qr.query(`
        ALTER TABLE documentos_normativos DROP COLUMN IF EXISTS deleted_at
      `);
      console.log('Columna deleted_at eliminada.');
    }

    await qr.release();
    console.log('Migración completada.');
  } finally {
    await ds.destroy();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
