import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario, AuthProvider, UsuarioRol } from '../usuarios/entities/usuario.entity';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { ResponseUsuarioDto } from '../usuarios/dto/response-usuario.dto';
import { EstadoTrabajador } from '../trabajadores/entities/trabajador.entity';

export interface JwtPayload {
  sub: string;
  dni: string;
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

  async validateUser(dni: string, password: string): Promise<Usuario | null> {
    const usuario = await this.usuariosService.findByDni(dni);

    if (!usuario) {
      return null;
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta está desactivada');
    }

    // REGLA DE BLOQUEO CRÍTICO: Verificar estado del trabajador vinculado según el rol
    // Solo SUPER_ADMIN y ADMIN_EMPRESA pueden hacer login sin trabajador vinculado
    // Roles operativos (EMPLEADO, SUPERVISOR, MEDICO, INGENIERO_SST, AUDITOR) OBLIGATORIAMENTE requieren trabajador activo
    const rolesOperativos = [
      UsuarioRol.EMPLEADO,
      UsuarioRol.SUPERVISOR,
      UsuarioRol.MEDICO,
      UsuarioRol.INGENIERO_SST,
      UsuarioRol.AUDITOR,
    ];
    const esRolOperativo = usuario.roles.some((rol) => rolesOperativos.includes(rol));
    
    if (esRolOperativo) {
      // BLOQUEO OBLIGATORIO: Roles operativos DEBEN tener trabajador vinculado y activo
      if (!usuario.trabajador) {
        throw new UnauthorizedException(
          'Acceso denegado: Su cuenta requiere un vínculo laboral activo. Contacte al administrador.',
        );
      }
      if (usuario.trabajador.estado !== EstadoTrabajador.Activo) {
        throw new UnauthorizedException(
          'Acceso denegado: Su vínculo laboral no está activo. Contacte al administrador.',
        );
      }
    } else {
      // Para roles administrativos (SUPER_ADMIN, ADMIN_EMPRESA) con trabajador vinculado, también verificar estado
      if (usuario.trabajador && usuario.trabajador.estado !== EstadoTrabajador.Activo) {
        throw new UnauthorizedException(
          'Acceso denegado: Su vínculo laboral no está activo',
        );
      }
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

  async login(dni: string, password: string): Promise<LoginResponse> {
    const usuario = await this.validateUser(dni, password);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: usuario.id, dni: usuario.dni };
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
