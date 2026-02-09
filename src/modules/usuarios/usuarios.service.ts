import {
  Injectable,
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ArrayContains } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, AuthProvider, UsuarioRol } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    const existing = await this.usuarioRepository.findOne({
      where: { dni: dto.dni },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un usuario registrado con este DNI',
      );
    }

    let passwordHash: string | null = null;
    if (dto.authProvider === AuthProvider.LOCAL) {
      // Si no se proporciona password, usar DNI como contraseña temporal
      const passwordToHash = dto.password || dto.dni;
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(passwordToHash, saltRounds);
    }

    const usuario = this.usuarioRepository.create({
      dni: dto.dni,
      passwordHash,
      authProvider: dto.authProvider ?? AuthProvider.LOCAL,
      providerId: dto.providerId ?? null,
      roles: dto.roles,
      empresaId: dto.empresaId ?? null,
      trabajador: dto.trabajadorId
        ? ({ id: dto.trabajadorId } as any)
        : undefined,
      activo: true,
      debeCambiarPassword: true, // Por defecto debe cambiar contraseña
    });

    const saved = await this.usuarioRepository.save(usuario);
    return ResponseUsuarioDto.fromEntity({
      ...saved,
      roles: saved.roles as typeof saved.roles,
    });
  }

  async findByDni(dni: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { dni },
      relations: ['trabajador'],
    });
  }


  async findById(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<ResponseUsuarioDto[]> {
    const usuarios = await this.usuarioRepository.find({
      order: { createdAt: 'DESC' },
    });
    return usuarios.map((usuario) =>
      ResponseUsuarioDto.fromEntity({
        ...usuario,
        roles: usuario.roles as typeof usuario.roles,
      }),
    );
  }

  async findOne(id: string): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['trabajador'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return ResponseUsuarioDto.fromEntity({
      ...usuario,
      roles: usuario.roles as typeof usuario.roles,
    });
  }

  async update(
    id: string,
    dto: UpdateUsuarioDto,
    currentUserId?: string,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['trabajador'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isCurrentlySuperAdmin = usuario.roles.includes(UsuarioRol.SUPER_ADMIN);
    
    // Solo ejecutar validaciones críticas si se intenta modificar roles o activo
    const isModifyingRoles = dto.roles !== undefined;
    const isModifyingActivo = dto.activo !== undefined;

    if (currentUserId && currentUserId === id && isModifyingRoles) {
      // Solo bloqueamos si el SUPER_ADMIN intenta QUITARSE el rol a sí mismo
      const stillHasAdminRole = dto.roles?.includes(UsuarioRol.SUPER_ADMIN);
      if (!stillHasAdminRole) {
        throw new PreconditionFailedException(
          'No puedes eliminar tu propio rol de administrador por seguridad',
        );
      }
  // Si el rol SUPER_ADMIN se mantiene en el array, permitimos que pase 
  // para que pueda actualizar su trabajadorId o empresaId
}

    // Validación específica: PreconditionFailedException (412) solo para casos críticos
    // Solo se dispara si el usuario es el último SUPER_ADMIN activo Y el DTO recibido:
    // a) No incluye el rol SUPER_ADMIN en el arreglo roles (intento de degradación)
    // b) Tiene el campo activo en false (intento de desactivación)
    if (isCurrentlySuperAdmin && (isModifyingRoles || isModifyingActivo)) {
      const willRemainSuperAdmin = isModifyingRoles
        ? dto.roles!.includes(UsuarioRol.SUPER_ADMIN)
        : isCurrentlySuperAdmin;
      const willBeActive = isModifyingActivo ? dto.activo! : usuario.activo;

      // Contar cuántos SUPER_ADMIN activos existen
      // La búsqueda considera tanto el rol SUPER_ADMIN como el estado activo: true
      const superAdminCount = await this.usuarioRepository.count({
        where: {
          roles: ArrayContains([UsuarioRol.SUPER_ADMIN]),
          activo: true,
        },
      });

      // Si es el único SUPER_ADMIN activo, validar operaciones críticas
      if (superAdminCount === 1) {
        // Caso a): Intentar quitarse el rol de SUPER_ADMIN (degradación)
        if (isModifyingRoles && !willRemainSuperAdmin) {
          throw new PreconditionFailedException(
            'No se puede eliminar el rol del único administrador del sistema',
          );
        }
        // Caso b): Intentar desactivar su cuenta
        if (isModifyingActivo && !willBeActive) {
          throw new PreconditionFailedException(
            'No se puede desactivar la cuenta del único administrador del sistema',
          );
        }
      }
    }

    // PERMITIR VINCULACIÓN: El SUPER_ADMIN puede asignarse trabajador_id y empresa_id
    // Esto permite que el usuario con más privilegios tenga un perfil de trabajador completo
    // Nota: Un SUPER_ADMIN vinculado a un Trabajador mantiene todos sus permisos globales
    // independientemente de la empresa asignada, ya que los permisos se basan en roles, no en empresa_id

    // Actualizar solo los campos proporcionados
    if (dto.roles !== undefined) {
      usuario.roles = dto.roles;
    }

    if (dto.activo !== undefined) {
      usuario.activo = dto.activo;
    }

    if (dto.debe_cambiar_password !== undefined) {
      usuario.debeCambiarPassword = dto.debe_cambiar_password;
    }

    // Permitir actualización de empresaId sin restricciones para SUPER_ADMIN
    if (dto.empresaId !== undefined) {
      usuario.empresaId = dto.empresaId || null;
    }

    // Permitir actualización de trabajadorId sin restricciones para SUPER_ADMIN
    if (dto.trabajadorId !== undefined) {
      // Si se pasa null o undefined, desvincular el trabajador
      if (dto.trabajadorId) {
        usuario.trabajador = { id: dto.trabajadorId } as any;
      } else {
        usuario.trabajador = null;
      }
    }

    const updated = await this.usuarioRepository.save(usuario);

    // Recargar con relaciones para obtener el trabajador actualizado
    const reloaded = await this.usuarioRepository.findOne({
      where: { id: updated.id },
      relations: ['trabajador'],
    });

    if (!reloaded) {
      throw new NotFoundException('Usuario no encontrado después de actualizar');
    }

    return ResponseUsuarioDto.fromEntity({
      ...reloaded,
      roles: reloaded.roles as typeof reloaded.roles,
    });
  }

  async changePassword(id: string, nuevaPassword: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(nuevaPassword, saltRounds);

    usuario.passwordHash = passwordHash;
    usuario.debeCambiarPassword = false; // Ya cambió la contraseña

    await this.usuarioRepository.save(usuario);
  }

  async resetPassword(id: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['trabajador'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener DNI del trabajador vinculado o del usuario mismo
    let dniParaPassword: string;
    if (usuario.trabajador) {
      // Buscar el trabajador para obtener su DNI
      const trabajadorRepo = this.usuarioRepository.manager.getRepository(
        'Trabajador',
      );
      const trabajador = await trabajadorRepo.findOne({
        where: { id: usuario.trabajador.id },
      });
      if (trabajador) {
        dniParaPassword = (trabajador as any).documentoIdentidad;
      } else {
        dniParaPassword = usuario.dni; // Fallback al DNI del usuario
      }
    } else {
      dniParaPassword = usuario.dni;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dniParaPassword, saltRounds);

    usuario.passwordHash = passwordHash;
    usuario.debeCambiarPassword = true; // Debe cambiar la contraseña después del reset

    await this.usuarioRepository.save(usuario);
  }
}
