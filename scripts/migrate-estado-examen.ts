/**
 * Migración de estados de ExamenMedico al nuevo flujo.
 * EJECUTAR ANTES DE INICIAR LA APP si tiene datos con estado "Realizado" o "Revisado".
 *
 * Ejecutar: npm run migrate:estado-examen
 * o: npx ts-node -r tsconfig-paths/register scripts/migrate-estado-examen.ts
 *
 * Mapeo:
 * - Realizado → Pruebas Cargadas
 * - Revisado → Completado
 */
import * as dotenv from 'dotenv';
// Cargar .env (dotenv viene con @nestjs/config)
dotenv.config();

import { DataSource } from 'typeorm';

const ENUM_NAME = 'examenes_medicos_estado_enum';

async function migrate() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'sst_user',
    password: process.env.DB_PASSWORD || 'sst_password',
    database: process.env.DB_DATABASE || 'sst_db',
    entities: [],
    synchronize: false,
  });
  await ds.initialize();

  const qr = ds.createQueryRunner();
  await qr.connect();

  try {
    // 1. Agregar nuevos valores al enum (cada ADD VALUE en transacción separada en PG)
    const nuevosValores = ['Pruebas Cargadas', 'Completado', 'Entregado', 'Observado', 'Reprogramado', 'Cancelado'];
    for (const val of nuevosValores) {
      try {
        await qr.query(`ALTER TYPE "${ENUM_NAME}" ADD VALUE IF NOT EXISTS '${val}'`);
        console.log(`  + Enum value: ${val}`);
      } catch (e: any) {
        if (e.message?.includes('already exists')) console.log(`  (${val} ya existe)`);
        else throw e;
      }
    }

    // 2. Migrar datos ANTES de que TypeORM intente alterar la columna
    await qr.query(`UPDATE examenes_medicos SET estado = 'Pruebas Cargadas'::"${ENUM_NAME}" WHERE estado::text = 'Realizado'`);
    await qr.query(`UPDATE examenes_medicos SET estado = 'Completado'::"${ENUM_NAME}" WHERE estado::text = 'Revisado'`);
    console.log(`  Datos migrados: Realizado→Pruebas Cargadas, Revisado→Completado`);

    // 3. Columna visto_por_admin
    await qr.query(`ALTER TABLE examenes_medicos ADD COLUMN IF NOT EXISTS visto_por_admin boolean DEFAULT false`);
    console.log('  + Columna visto_por_admin');

    console.log('\nMigración completada. Ya puede iniciar la aplicación.');
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

migrate().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
