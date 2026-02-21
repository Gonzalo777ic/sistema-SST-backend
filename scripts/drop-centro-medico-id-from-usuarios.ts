/**
 * Migración: Eliminar columna centro_medico_id de usuarios.
 * Ejecutar DESPUÉS de migrate-centro-medico-to-participacion.ts
 *
 * La vinculación Usuario <-> Centro Médico es EXCLUSIVA a través de UsuarioCentroMedico.
 *
 * Ejecutar: npx ts-node -r tsconfig-paths/register scripts/drop-centro-medico-id-from-usuarios.ts
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

  // Verificar que no queden usuarios con centro_medico_id sin participación
  const pendientes = await dataSource.query(
    `SELECT u.id, u.dni FROM usuarios u
     WHERE u.centro_medico_id IS NOT NULL
       AND u.deleted_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM usuario_centro_medico ucm
         WHERE ucm.usuario_id = u.id AND ucm.deleted_at IS NULL
       )`,
  );

  if (pendientes.length > 0) {
    console.error(
      'ERROR: Hay usuarios con centro_medico_id sin participación en usuario_centro_medico.',
      'Ejecute primero: npx ts-node -r tsconfig-paths/register scripts/migrate-centro-medico-to-participacion.ts',
    );
    console.error('Usuarios pendientes:', pendientes);
    await dataSource.destroy();
    process.exit(1);
  }

  await dataSource.query(`
    ALTER TABLE usuarios DROP COLUMN IF EXISTS centro_medico_id;
  `);

  console.log('Migración completada. Columna centro_medico_id eliminada.');
  await dataSource.destroy();
}

migrate().catch((err) => {
  console.error('Error en migración:', err);
  process.exit(1);
});
