/**
 * Script de limpieza de tablas de usuarios y trabajadores
 * IMPORTANTE: Este script mantiene solo al SUPER_ADMIN inicial del seeder
 * 
 * Uso:
 *   npm run cleanup:users-trabajadores
 *   o
 *   ts-node scripts/cleanup-users-trabajadores.ts
 */

import { DataSource } from 'typeorm';
import { Usuario } from '../src/modules/usuarios/entities/usuario.entity';
import { Trabajador } from '../src/modules/trabajadores/entities/trabajador.entity';
import { UsuarioRol } from '../src/modules/usuarios/entities/usuario.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sst_db',
    entities: [Usuario, Trabajador],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    const usuarioRepository = dataSource.getRepository(Usuario);
    const trabajadorRepository = dataSource.getRepository(Trabajador);

    // Obtener el DNI del SUPER_ADMIN desde la variable de entorno
    const adminDni = process.env.ADMIN_DNI;
    if (!adminDni) {
      throw new Error(
        'ADMIN_DNI no está configurado en el archivo .env. No se puede ejecutar la limpieza de forma segura.',
      );
    }

    console.log(`🔍 Buscando SUPER_ADMIN con DNI: ${adminDni}`);

    // Verificar que el SUPER_ADMIN existe
    const adminUsuario = await usuarioRepository.findOne({
      where: {
        dni: adminDni,
        roles: UsuarioRol.SUPER_ADMIN as any, // TypeORM array contains
      },
    });

    if (!adminUsuario) {
      throw new Error(
        `No se encontró un SUPER_ADMIN con DNI ${adminDni}. Verifica la configuración.`,
      );
    }

    console.log(`✅ SUPER_ADMIN encontrado: ${adminUsuario.dni} (ID: ${adminUsuario.id})`);

    // Eliminar usuarios que NO sean el SUPER_ADMIN
    const usuariosEliminados = await usuarioRepository
      .createQueryBuilder()
      .delete()
      .from(Usuario)
      .where('id != :adminId', { adminId: adminUsuario.id })
      .execute();

    console.log(`🗑️  Usuarios eliminados: ${usuariosEliminados.affected}`);

    // Eliminar todos los trabajadores (soft delete ya no aplica, eliminación física)
    const trabajadoresEliminados = await trabajadorRepository
      .createQueryBuilder()
      .delete()
      .from(Trabajador)
      .execute();

    console.log(`🗑️  Trabajadores eliminados: ${trabajadoresEliminados.affected}`);

    // Verificación: Mostrar usuarios restantes
    const usuariosRestantes = await usuarioRepository.find();
    console.log('\n📋 Usuarios restantes:');
    usuariosRestantes.forEach((u) => {
      console.log(`  - DNI: ${u.dni}, Roles: ${u.roles.join(', ')}, Activo: ${u.activo}`);
    });

    console.log('\n✅ Limpieza completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

cleanup();
