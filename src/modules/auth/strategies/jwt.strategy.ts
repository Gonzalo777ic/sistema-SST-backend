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

    // REGLA DE BLOQUEO CRÍTICO: Verificar estado del trabajador vinculado según el rol
    // Solo SUPER_ADMIN y ADMIN_EMPRESA pueden hacer requests sin trabajador vinculado
    // Roles operativos (EMPLEADO, SUPERVISOR, MEDICO, INGENIERO_SST, AUDITOR) OBLIGATORIAMENTE requieren trabajador activo
    const rolesOperativos = [
      UsuarioRol.EMPLEADO,
      UsuarioRol.SUPERVISOR,
      UsuarioRol.MEDICO,
      UsuarioRol.INGENIERO_SST,
      UsuarioRol.AUDITOR,
      UsuarioRol.CENTRO_MEDICO,
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

    return {
      id: usuario.id,
      dni: usuario.dni,
      roles: usuario.roles,
      trabajadorId: usuario.trabajador?.id ?? null,
      empresaId: usuario.empresaId ?? null,
    };
  }
}
