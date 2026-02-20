import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UsuarioCentroMedicoService } from '../usuario-centro-medico/usuario-centro-medico.service';
import { Usuario, AuthProvider, UsuarioRol } from '../usuarios/entities/usuario.entity';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { ResponseUsuarioDto } from '../usuarios/dto/response-usuario.dto';
import { Trabajador, EstadoTrabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';

export interface JwtPayload {
  sub: string;
  dni: string;
}

export interface EmpresaVinculada {
  id: string;
  nombre: string;
  logoUrl: string | null;
}

export interface LoginResponse {
  access_token: string;
  usuario: ResponseUsuarioDto;
  empresasVinculadas: EmpresaVinculada[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly usuarioCentroMedicoService: UsuarioCentroMedicoService,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async validateUser(dni: string, password: string): Promise<Usuario | null> {
    const usuario = await this.usuariosService.findByDni(dni);

    if (!usuario) {
      return null;
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta está desactivada');
    }

    // REGLA DE BLOQUEO CRÍTICO: Verificar vínculo según el rol
    // CENTRO_MEDICO: puede tener centro_medico_id (sin trabajador) o trabajador
    // Otros roles operativos: requieren trabajador activo
    const esCentroMedico = usuario.roles.includes(UsuarioRol.CENTRO_MEDICO);
    const rolesOperativos = [
      UsuarioRol.EMPLEADO,
      UsuarioRol.SUPERVISOR,
      UsuarioRol.MEDICO,
      UsuarioRol.INGENIERO_SST,
      UsuarioRol.AUDITOR,
    ];
    const esRolOperativo = usuario.roles.some((rol) => rolesOperativos.includes(rol));

    if (esCentroMedico) {
      const tieneParticipacion = await this.usuarioCentroMedicoService.tieneAccesoCentro(
        usuario.id,
        usuario.centroMedicoId,
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
    } else if (esRolOperativo) {
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

    // Actualizar último acceso después de validar credenciales
    usuario.ultimoAcceso = new Date();
    await this.usuariosService.updateUltimoAcceso(usuario.id);

    // Buscar todos los trabajadores con el mismo DNI para obtener empresas vinculadas
    const trabajadores = await this.trabajadorRepository.find({
      where: {
        documentoIdentidad: usuario.dni,
      },
      relations: ['empresa'],
      withDeleted: false, // Excluir trabajadores eliminados (soft delete)
    });

    // Extraer empresas únicas de los trabajadores encontrados
    const empresasMap = new Map<string, EmpresaVinculada>();
    
    for (const trabajador of trabajadores) {
      if (trabajador.empresa && trabajador.empresa.activo) {
        if (!empresasMap.has(trabajador.empresa.id)) {
          empresasMap.set(trabajador.empresa.id, {
            id: trabajador.empresa.id,
            nombre: trabajador.empresa.nombre,
            logoUrl: trabajador.empresa.logoUrl,
          });
        }
      }
    }

    const empresasVinculadas = Array.from(empresasMap.values());

    const payload: JwtPayload = { sub: usuario.id, dni: usuario.dni };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      usuario: ResponseUsuarioDto.fromEntity({
        ...usuario,
        roles: usuario.roles as typeof usuario.roles,
      }),
      empresasVinculadas,
    };
  }

  async register(dto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    return this.usuariosService.create(dto);
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.usuariosService.findById(id);
  }
}
