/**
 * Migración: Poblar campos nuevos (nombres, apellidos, tipo_documento, numero_documento)
 * en trabajadores existentes que tienen nombre_completo y documento_identidad.
 *
 * Ejecutar: npx ts-node -r tsconfig-paths/register scripts/migrate-trabajadores-to-new-schema.ts
 */
import { DataSource } from 'typeorm';
import * as path from 'path';

async function migrate() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sst_db',
    entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
    synchronize: false,
  });

  await dataSource.initialize();

  // Poblar campos nuevos para registros existentes
  const result = await dataSource.query(`
    UPDATE trabajadores
    SET
      nombres = COALESCE(nombres, nombre_completo),
      apellido_paterno = COALESCE(apellido_paterno, ''),
      apellido_materno = COALESCE(apellido_materno, ''),
      tipo_documento = COALESCE(tipo_documento, 'DNI'),
      numero_documento = COALESCE(numero_documento, documento_identidad)
    WHERE numero_documento IS NULL
  `);

  console.log('Migración completada.');
  await dataSource.destroy();
}

migrate().catch((err) => {
  console.error('Error en migración:', err);
  process.exit(1);
});
