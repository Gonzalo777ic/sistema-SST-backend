import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.service';
import { EstadoTrabajador } from '../../trabajadores/entities/trabajador.entity';
import { UsuarioRol } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-secret-change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.authService.findById(payload.sub);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta está desactivada');
    }

    // REGLA DE BLOQUEO: Verificar estado del trabajador vinculado según el rol
    // Roles administrativos abstractos (SUPER_ADMIN, ADMIN_EMPRESA) pueden hacer requests sin trabajador vinculado
    // Roles operativos vinculados (EMPLEADO, SUPERVISOR, MEDICO, INGENIERO_SST) requieren trabajador activo
    const rolesAdministrativos = [UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA];
    const esRolAdministrativo = usuario.roles.some((rol) => rolesAdministrativos.includes(rol));
    
    if (!esRolAdministrativo) {
      // Para roles operativos, es obligatorio tener trabajador vinculado y activo
      if (!usuario.trabajador) {
        throw new UnauthorizedException(
          'Acceso denegado: Su cuenta requiere un vínculo laboral activo',
        );
      }
      if (usuario.trabajador.estado !== EstadoTrabajador.Activo) {
        throw new UnauthorizedException(
          'Acceso denegado: Su vínculo laboral no está activo',
        );
      }
    } else if (usuario.trabajador && usuario.trabajador.estado !== EstadoTrabajador.Activo) {
      // Para roles administrativos con trabajador vinculado, también verificar estado
      throw new UnauthorizedException(
        'Acceso denegado: Su vínculo laboral no está activo',
      );
    }

    return { id: usuario.id, dni: usuario.dni, roles: usuario.roles };
  }
}
