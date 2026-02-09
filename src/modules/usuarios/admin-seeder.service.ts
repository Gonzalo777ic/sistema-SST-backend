import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, AuthProvider, UsuarioRol } from './entities/usuario.entity';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedTestUsers();
  }

  private async seedAdmin(): Promise<void> {
    const adminDni = this.configService.get<string>('ADMIN_DNI');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminDni || !adminPassword) {
      this.logger.warn(
        'ADMIN_DNI o ADMIN_PASSWORD no están configuradas. Seeder de administrador omitido.',
      );
      return;
    }

    try {
      const existingAdmin = await this.usuarioRepository.findOne({
        where: { dni: adminDni },
      });

      if (existingAdmin) {
        this.logger.log(
          `Usuario administrador ya existe: DNI ${adminDni}`,
        );
        return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

      const admin = this.usuarioRepository.create({
        dni: adminDni,
        passwordHash,
        authProvider: AuthProvider.LOCAL,
        providerId: null,
        roles: [UsuarioRol.SUPER_ADMIN],
        empresaId: null,
        activo: true,
        debeCambiarPassword: true, // Por defecto debe cambiar contraseña
      });

      await this.usuarioRepository.save(admin);

      this.logger.log(
        `Usuario administrador creado exitosamente: DNI ${adminDni}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al crear usuario administrador: ${error.message}`,
        error.stack,
      );
    }
  }

  private async seedTestUsers(): Promise<void> {
    // Solo crear usuarios de prueba si estamos en desarrollo
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'production') {
      this.logger.log('Modo producción detectado. Omitiendo creación de usuarios de prueba.');
      return;
    }

    const saltRounds = 10;
    const testPassword = '12345678'; // Contraseña temporal para usuarios de prueba
    const passwordHash = await bcrypt.hash(testPassword, saltRounds);

    // Usuarios de prueba para cada rol (excepto SUPER_ADMIN que ya se crea arriba)
    const testUsers = [
      {
        dni: '11111111',
        roles: [UsuarioRol.ADMIN_EMPRESA],
        nombre: 'Admin Empresa',
      },
      {
        dni: '22222222',
        roles: [UsuarioRol.INGENIERO_SST],
        nombre: 'Ingeniero SST',
      },
      {
        dni: '33333333',
        roles: [UsuarioRol.SUPERVISOR],
        nombre: 'Supervisor',
      },
      {
        dni: '44444444',
        roles: [UsuarioRol.MEDICO],
        nombre: 'Médico Ocupacional',
      },
      {
        dni: '55555555',
        roles: [UsuarioRol.EMPLEADO],
        nombre: 'Empleado',
      },
      {
        dni: '66666666',
        roles: [UsuarioRol.AUDITOR],
        nombre: 'Auditor',
      },
    ];

    for (const testUser of testUsers) {
      try {
        const existing = await this.usuarioRepository.findOne({
          where: { dni: testUser.dni },
        });

        if (existing) {
          this.logger.log(
            `Usuario de prueba ya existe: DNI ${testUser.dni} (${testUser.nombre})`,
          );
          continue;
        }

        const usuario = this.usuarioRepository.create({
          dni: testUser.dni,
          passwordHash,
          authProvider: AuthProvider.LOCAL,
          providerId: null,
          roles: testUser.roles,
          empresaId: null,
          activo: true,
          debeCambiarPassword: true,
        });

        await this.usuarioRepository.save(usuario);

        this.logger.log(
          `Usuario de prueba creado: DNI ${testUser.dni} (${testUser.nombre}) - Roles: ${testUser.roles.join(', ')}`,
        );
      } catch (error) {
        this.logger.error(
          `Error al crear usuario de prueba ${testUser.dni}: ${error.message}`,
        );
      }
    }
  }
}
