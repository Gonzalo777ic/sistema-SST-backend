import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario, AuthProvider } from '../usuarios/entities/usuario.entity';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { ResponseUsuarioDto } from '../usuarios/dto/response-usuario.dto';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: ResponseUsuarioDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Usuario | null> {
    const usuario = await this.usuariosService.findByEmail(email);

    if (!usuario) {
      return null;
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta está desactivada');
    }

    if (usuario.authProvider !== AuthProvider.LOCAL || !usuario.passwordHash) {
      throw new UnauthorizedException(
        'Este usuario utiliza autenticación externa',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return usuario;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const usuario = await this.validateUser(email, password);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: usuario.id, email: usuario.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      usuario: ResponseUsuarioDto.fromEntity({
        ...usuario,
        roles: usuario.roles as typeof usuario.roles,
      }),
    };
  }

  async register(dto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    return this.usuariosService.create(dto);
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.usuariosService.findById(id);
  }
}
