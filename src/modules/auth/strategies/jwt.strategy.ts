import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../auth.service';
import { EstadoTrabajador } from '../../trabajadores/entities/trabajador.entity';
import { UsuarioRol } from '../../usuarios/entities/usuario.entity';
import { UsuarioCentroMedicoService } from '../../usuario-centro-medico/usuario-centro-medico.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usuarioCentroMedicoService: UsuarioCentroMedicoService,
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

    // REGLA DE BLOQUEO CRÍTICO: Verificar vínculo según el rol
    // CENTRO_MEDICO: requiere participación activa en UsuarioCentroMedico (sin trabajador) o trabajador
    // Otros roles operativos: requieren trabajador activo
    const esCentroMedico = usuario.roles.includes(UsuarioRol.CENTRO_MEDICO);
    const rolesOperativosSinCentro = [
      UsuarioRol.EMPLEADO,
      UsuarioRol.SUPERVISOR,
      UsuarioRol.MEDICO,
      UsuarioRol.INGENIERO_SST,
      UsuarioRol.AUDITOR,
    ];
    const esRolOperativoOtro = usuario.roles.some((rol) => rolesOperativosSinCentro.includes(rol));

    if (esCentroMedico) {
      // CENTRO_MEDICO: requiere participación activa en centro(s) O trabajador vinculado
      const tieneParticipacion = await this.usuarioCentroMedicoService.tieneAccesoCentro(
        usuario.id,
      );
      if (!usuario.trabajador && !tieneParticipacion) {
        throw new UnauthorizedException(
          'Acceso denegado: Su cuenta requiere estar vinculada a un centro médico. Contacte al administrador.',
        );
      }
      if (usuario.trabajador && usuario.trabajador.estado !== EstadoTrabajador.Activo) {
        throw new UnauthorizedException(
          'Acceso denegado: Su vínculo laboral no está activo. Contacte al administrador.',
        );
      }
    } else if (esRolOperativoOtro) {
      // Otros roles operativos: requieren trabajador activo
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

    const centrosActivos = await this.usuarioCentroMedicoService.getCentrosActivosPorUsuario(
      usuario.id,
    );
    return {
      id: usuario.id,
      dni: usuario.dni,
      roles: usuario.roles,
      trabajadorId: usuario.trabajador?.id ?? null,
      empresaId: usuario.empresaId ?? null,
      centroMedicoId: centrosActivos[0] ?? null,
      centrosMedicosActivos: centrosActivos,
    };
  }
}
