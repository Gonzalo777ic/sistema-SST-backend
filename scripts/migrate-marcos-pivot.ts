/**
 * Migración: Pobla la tabla pivote empresa_marco_normativo con los marcos existentes.
 * Ejecutar una vez después de agregar la tabla pivote.
 * Los marcos que tienen empresa_id se vinculan automáticamente a esa empresa.
 *
 * Uso: npx ts-node -r tsconfig-paths/register scripts/migrate-marcos-pivot.ts
 */
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'sst_user',
    password: process.env.DB_PASSWORD || 'sst_password',
    database: process.env.DB_DATABASE || 'sst_db',
    synchronize: false,
  });

  await ds.initialize();

  try {
    // Verificar si la columna empresa_id existe (esquema antiguo)
    const tableExists = await ds.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'marcos_normativos' AND column_name = 'empresa_id'
    `);

    if (tableExists.length === 0) {
      console.log('La tabla marcos_normativos ya usa el nuevo esquema o no existe. Nada que migrar.');
      return;
    }

    // Verificar si la tabla pivote existe
    const pivotExists = await ds.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa_marco_normativo'
    `);

    if (pivotExists.length === 0) {
      console.log('La tabla empresa_marco_normativo no existe. Ejecute la aplicación primero para crearla.');
      return;
    }

    // Insertar en pivot los marcos que tienen empresa_id y no están ya en pivot
    const result = await ds.query(`
      INSERT INTO empresa_marco_normativo (id, empresa_id, marco_normativo_id, created_at)
      SELECT gen_random_uuid(), m.empresa_id, m.id, NOW()
      FROM marcos_normativos m
      WHERE m.empresa_id IS NOT NULL
      AND m.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM empresa_marco_normativo p
        WHERE p.empresa_id = m.empresa_id AND p.marco_normativo_id = m.id
      )
    `);

    console.log('Migración completada. Marcos vinculados a sus empresas en la tabla pivote.');
  } finally {
    await ds.destroy();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
