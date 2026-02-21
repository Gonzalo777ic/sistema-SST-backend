/**
 * Migración: Crear registros en usuario_centro_medico a partir de usuarios
 * que tienen centro_medico_id. Permite transición al modelo de participación operativa.
 *
 * OBLIGATORIO ejecutar ANTES de eliminar la columna centro_medico_id.
 * Luego ejecutar: scripts/drop-centro-medico-id-from-usuarios.ts
 *
 * Ejecutar: npx ts-node -r tsconfig-paths/register scripts/migrate-centro-medico-to-participacion.ts
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

  const usuariosConCentro = await dataSource.query(
    `SELECT id, centro_medico_id FROM usuarios WHERE centro_medico_id IS NOT NULL AND deleted_at IS NULL`,
  );

  let insertados = 0;
  for (const u of usuariosConCentro) {
    const existente = await dataSource.query(
      `SELECT id FROM usuario_centro_medico WHERE usuario_id = $1 AND centro_medico_id = $2 AND deleted_at IS NULL`,
      [u.id, u.centro_medico_id],
    );
    if (existente.length > 0) continue;

    await dataSource.query(
      `INSERT INTO usuario_centro_medico (id, usuario_id, centro_medico_id, estado, fecha_inicio, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'activo', CURRENT_DATE, NOW(), NOW())`,
      [u.id, u.centro_medico_id],
    );
    insertados++;
  }

  console.log(`Migración completada. Participaciones creadas: ${insertados}`);
  await dataSource.destroy();
}

migrate().catch((err) => {
  console.error('Error en migración:', err);
  process.exit(1);
});
