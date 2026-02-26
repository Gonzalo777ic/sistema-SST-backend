/**
 * Backfill: Poblar epp_*_historico en detalles de solicitudes entregadas que no tienen snapshot.
 * Ejecutar una vez después de desplegar la funcionalidad de consistencia histórica.
 * Uso: npx ts-node -r tsconfig-paths/register scripts/backfill-epp-snapshot.ts
 */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sst',
    synchronize: false,
  });

  await ds.initialize();

  await ds.query(`
    UPDATE solicitudes_epp_detalle d
    SET
      epp_nombre_historico = COALESCE(d.epp_nombre_historico, e.nombre),
      epp_tipo_proteccion_historico = COALESCE(d.epp_tipo_proteccion_historico, e.tipo_proteccion::text),
      epp_categoria_historica = COALESCE(d.epp_categoria_historica, e.categoria::text),
      epp_descripcion_historica = COALESCE(d.epp_descripcion_historica, e.descripcion),
      epp_vigencia_historica = COALESCE(d.epp_vigencia_historica, e.vigencia::text),
      epp_imagen_url_historica = COALESCE(d.epp_imagen_url_historica, e.imagen_url)
    FROM solicitudes_epp s, epp e
    WHERE d.solicitud_epp_id = s.id
      AND d.epp_id = e.id
      AND d.exceptuado = false
      AND s.estado = 'ENTREGADA'
      AND d.epp_nombre_historico IS NULL
  `);

  console.log('Backfill de snapshot EPP completado.');
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
