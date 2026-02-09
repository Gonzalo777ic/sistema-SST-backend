import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.service';
import { EstadoTrabajador } from '../../trabajadores/entities/trabajador.entity';

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

    // REGLA DE BLOQUEO: Verificar estado del trabajador vinculado en cada request
    // Si el usuario tiene un trabajador vinculado y su estado NO ES 'Activo', bloquear acceso
    if (usuario.trabajador && usuario.trabajador.estado !== EstadoTrabajador.Activo) {
      throw new UnauthorizedException(
        'Acceso denegado: Su vínculo laboral no está activo',
      );
    }

    return { id: usuario.id, dni: usuario.dni, roles: usuario.roles };
  }
}
