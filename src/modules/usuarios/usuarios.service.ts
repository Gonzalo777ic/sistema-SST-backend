import {
  Injectable,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, AuthProvider } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
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
}
