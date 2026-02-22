/**
 * Seeder para poblar la tabla cie10 desde data/codes.json.
 * Upsert: si el código ya existe, actualiza.
 *
 * Ejecutar: npm run seed:cie10
 * o: npx ts-node -r tsconfig-paths/register scripts/seed-cie10.ts
 *
 * Requisito: La tabla cie10 debe existir (ejecutar la app una vez con synchronize).
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config();

import { DataSource } from 'typeorm';
import { Cie10 } from '../src/modules/cie10/entities/cie10.entity';

interface CodeRecord {
  code: string;
  description: string;
  level: number;
  code_0?: string;
  code_1?: string;
  code_2?: string;
}

async function seed() {
  const jsonPath = path.join(__dirname, '../data/codes.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('No se encontró data/codes.json');
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const records: CodeRecord[] = JSON.parse(raw);
  if (!Array.isArray(records) || records.length === 0) {
    console.error('El JSON está vacío o no es un array');
    process.exit(1);
  }

  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'sst_user',
    password: process.env.DB_PASSWORD || 'sst_password',
    database: process.env.DB_DATABASE || 'sst_db',
    entities: [Cie10],
    synchronize: false,
  });
  await ds.initialize();

  // Crear tabla si no existe (para poder ejecutar el seed sin iniciar la app)
  await ds.query(`
    CREATE TABLE IF NOT EXISTS cie10 (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code varchar(20) UNIQUE NOT NULL,
      description text NOT NULL,
      level int DEFAULT 0,
      code_0 varchar(20),
      code_1 varchar(20),
      code_2 varchar(20)
    );
    CREATE INDEX IF NOT EXISTS idx_cie10_code ON cie10(code);
    CREATE INDEX IF NOT EXISTS idx_cie10_description ON cie10(description);
  `);
  console.log('  Tabla cie10 verificada/creada.');

  const repo = ds.getRepository(Cie10);

  const entities = records.map((r) =>
    repo.create({
      code: r.code,
      description: r.description,
      level: r.level ?? 0,
      code0: r.code_0 ?? null,
      code1: r.code_1 ?? null,
      code2: r.code_2 ?? null,
    }),
  );

  const batchSize = 500;
  let inserted = 0;
  for (let i = 0; i < entities.length; i += batchSize) {
    const batch = entities.slice(i, i + batchSize);
    await repo.upsert(batch, { conflictPaths: ['code'] });
    inserted += batch.length;
    console.log(`  Procesados ${inserted}/${entities.length}`);
  }

  console.log(`\nSeeder completado: ${entities.length} códigos CIE10 importados/actualizados.`);
  await ds.destroy();
}

seed().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
