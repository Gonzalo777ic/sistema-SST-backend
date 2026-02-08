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
}
