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
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un usuario registrado con este email',
      );
    }

    let passwordHash: string | null = null;
    if (dto.authProvider === AuthProvider.LOCAL && dto.password) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(dto.password, saltRounds);
    } else if (dto.authProvider === AuthProvider.LOCAL && !dto.password) {
      throw new HttpException(
        'La contraseña es obligatoria para autenticación LOCAL',
        HttpStatus.BAD_REQUEST,
      );
    }

    const usuario = this.usuarioRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      authProvider: dto.authProvider ?? AuthProvider.LOCAL,
      providerId: dto.providerId ?? null,
      roles: dto.roles,
      empresaId: dto.empresaId ?? null,
      trabajador: dto.trabajadorId
        ? ({ id: dto.trabajadorId } as any)
        : undefined,
      activo: true,
    });

    const saved = await this.usuarioRepository.save(usuario);
    return ResponseUsuarioDto.fromEntity({
      ...saved,
      roles: saved.roles as typeof saved.roles,
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { email: email.toLowerCase() },
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

    // Validación: Protección de sesión propia
    if (currentUserId && currentUserId === id && dto.roles !== undefined) {
      throw new PreconditionFailedException(
        'No puedes cambiar tus propios roles por seguridad',
      );
    }

    // Validación: Último administrador del sistema
    const isCurrentlySuperAdmin = usuario.roles.includes(UsuarioRol.SUPER_ADMIN);
    const willRemainSuperAdmin =
      dto.roles !== undefined
        ? dto.roles.includes(UsuarioRol.SUPER_ADMIN)
        : isCurrentlySuperAdmin;
    const willBeActive = dto.activo !== undefined ? dto.activo : usuario.activo;

    // Si el usuario es SUPER_ADMIN y se intenta quitar el rol o desactivar
    if (isCurrentlySuperAdmin && (!willRemainSuperAdmin || !willBeActive)) {
      // Contar cuántos SUPER_ADMIN activos existen
      const superAdminCount = await this.usuarioRepository.count({
        where: {
          roles: ArrayContains([UsuarioRol.SUPER_ADMIN]),
          activo: true,
        },
      });

      // Si es el único SUPER_ADMIN activo, bloquear la operación
      if (superAdminCount === 1) {
        if (!willRemainSuperAdmin) {
          throw new PreconditionFailedException(
            'No se puede eliminar el rol del único administrador del sistema',
          );
        }
        if (!willBeActive) {
          throw new PreconditionFailedException(
            'No se puede desactivar la cuenta del único administrador del sistema',
          );
        }
      }
    }

    // Actualizar solo los campos proporcionados
    if (dto.roles !== undefined) {
      usuario.roles = dto.roles;
    }

    if (dto.activo !== undefined) {
      usuario.activo = dto.activo;
    }

    if (dto.empresaId !== undefined) {
      usuario.empresaId = dto.empresaId || null;
    }

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
}
