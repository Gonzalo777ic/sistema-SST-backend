import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, AuthProvider, UsuarioRol } from './entities/usuario.entity';
import { Trabajador, EstadoTrabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
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
        email: 'admin@gexim.com',
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

    // Obtener o crear empresa de prueba
    let empresaPrueba = await this.empresaRepository.findOne({
      where: { ruc: '20100070970' }, // RUC de ejemplo
    });

    if (!empresaPrueba) {
      empresaPrueba = this.empresaRepository.create({
        nombre: 'Empresa de Prueba SST',
        ruc: '20100070970',
        activo: true,
      });
      empresaPrueba = await this.empresaRepository.save(empresaPrueba);
      this.logger.log('Empresa de prueba creada');
    }

    const saltRounds = 10;
    const testPassword = '12345678'; // Contraseña temporal para usuarios de prueba
    const passwordHash = await bcrypt.hash(testPassword, saltRounds);

    // Usuarios de prueba para cada rol (excepto SUPER_ADMIN que ya se crea arriba)
    const testUsers = [
      {
        dni: '11111111',
        email: 'admin@test.com',
        roles: [UsuarioRol.ADMIN_EMPRESA],
        nombre: 'Admin Empresa',
        cargo: 'Administrador',
        necesitaTrabajador: false, // ADMIN_EMPRESA puede existir sin trabajador
      },
      {
        dni: '22222222',
        email: 'ingeniero@test.com',
        roles: [UsuarioRol.INGENIERO_SST],
        nombre: 'Ingeniero SST',
        cargo: 'Ingeniero de Seguridad',
        necesitaTrabajador: true,
      },
      {
        dni: '33333333',
        email: 'supervisor@test.com',
        roles: [UsuarioRol.SUPERVISOR],
        nombre: 'Supervisor',
        cargo: 'Supervisor de Producción',
        necesitaTrabajador: true,
      },
      {
        dni: '44444444',
        email: 'medico@test.com',
        roles: [UsuarioRol.MEDICO],
        nombre: 'Médico Ocupacional',
        cargo: 'Médico Ocupacional',
        necesitaTrabajador: true,
      },
      {
        dni: '55555555',
        email: 'empleado@test.com',
        roles: [UsuarioRol.EMPLEADO],
        nombre: 'Empleado',
        cargo: 'Operario',
        necesitaTrabajador: true,
      },
      {
        dni: '66666666',
        email: 'auditor@test.com',
        roles: [UsuarioRol.AUDITOR],
        nombre: 'Auditor',
        cargo: 'Auditor SST',
        necesitaTrabajador: true,
      },
    ];

    for (const testUser of testUsers) {
      try {
        const existing = await this.usuarioRepository.findOne({
          where: { dni: testUser.dni },
          relations: ['trabajador'],
        });

        if (existing) {
          this.logger.log(
            `Usuario de prueba ya existe: DNI ${testUser.dni} (${testUser.nombre})`,
          );
          // Si el usuario existe pero no tiene trabajador y lo necesita, crearlo
          if (testUser.necesitaTrabajador && !existing.trabajador) {
            await this.crearTrabajadorParaUsuario(existing, testUser, empresaPrueba.id);
          }
          continue;
        }

        const usuario = this.usuarioRepository.create({
          dni: testUser.dni,
          email: testUser.email,
          passwordHash,
          authProvider: AuthProvider.LOCAL,
          providerId: null,
          roles: testUser.roles,
          empresaId: empresaPrueba.id,
          activo: true,
          debeCambiarPassword: true,
        });

        const usuarioGuardado = await this.usuarioRepository.save(usuario);

        this.logger.log(
          `Usuario de prueba creado: DNI ${testUser.dni} (${testUser.nombre}) - Roles: ${testUser.roles.join(', ')}`,
        );

        // Crear trabajador vinculado para usuarios operativos
        if (testUser.necesitaTrabajador) {
          await this.crearTrabajadorParaUsuario(usuarioGuardado, testUser, empresaPrueba.id);
        }
      } catch (error) {
        this.logger.error(
          `Error al crear usuario de prueba ${testUser.dni}: ${error.message}`,
        );
      }
    }
  }

  private async crearTrabajadorParaUsuario(
    usuario: Usuario,
    testUser: { nombre: string; cargo: string; dni: string },
    empresaId: string,
  ): Promise<void> {
    try {
      // Verificar si ya existe un trabajador con este DNI en esta empresa
      const trabajadorExistente = await this.trabajadorRepository.findOne({
        where: { documentoIdentidad: testUser.dni, empresaId: empresaId },
      });

      if (trabajadorExistente) {
        // Si existe, vincularlo al usuario
        usuario.trabajador = trabajadorExistente;
        await this.usuarioRepository.save(usuario);
        this.logger.log(
          `Trabajador existente vinculado al usuario: DNI ${testUser.dni}`,
        );
        return;
      }

      // Crear nuevo trabajador
      const trabajador = this.trabajadorRepository.create({
        nombreCompleto: testUser.nombre,
        documentoIdentidad: testUser.dni,
        cargo: testUser.cargo,
        empresaId: empresaId,
        fechaIngreso: new Date(),
        estado: EstadoTrabajador.Activo, // Estado activo para permitir login
      });

      const trabajadorGuardado = await this.trabajadorRepository.save(trabajador);

      // Vincular trabajador al usuario (la relación OneToOne está en Usuario, no en Trabajador)
      usuario.trabajador = trabajadorGuardado;
      await this.usuarioRepository.save(usuario);

      this.logger.log(
        `Trabajador creado y vinculado: DNI ${testUser.dni} (${testUser.nombre})`,
      );
    } catch (error) {
      this.logger.error(
        `Error al crear trabajador para usuario ${testUser.dni}: ${error.message}`,
      );
    }
  }
}
