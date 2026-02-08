import { AuthProvider, UsuarioRol } from '../entities/usuario.entity';

export class ResponseUsuarioDto {
  id: string;
  dni: string;
  authProvider: AuthProvider;
  roles: UsuarioRol[];
  activo: boolean;
  debe_cambiar_password: boolean;
  ultimoAcceso: Date | null;
  empresaId: string | null;
  trabajadorId: string | null;
  perfil_completado?: boolean;
  createdAt: Date;

  static fromEntity(usuario: {
    id: string;
    dni: string;
    authProvider: AuthProvider;
    roles: UsuarioRol[];
    activo: boolean;
    debeCambiarPassword: boolean;
    ultimoAcceso: Date | null;
    empresaId: string | null;
    trabajador?: { id: string; perfilCompletado?: boolean } | null;
    createdAt: Date;
  }): ResponseUsuarioDto {
    const dto = new ResponseUsuarioDto();
    dto.id = usuario.id;
    dto.dni = usuario.dni;
    dto.authProvider = usuario.authProvider;
    dto.roles = usuario.roles;
    dto.activo = usuario.activo;
    dto.debe_cambiar_password = usuario.debeCambiarPassword;
    dto.ultimoAcceso = usuario.ultimoAcceso;
    dto.empresaId = usuario.empresaId;
    dto.trabajadorId = usuario.trabajador?.id ?? null;
    dto.perfil_completado = usuario.trabajador?.perfilCompletado ?? false;
    dto.createdAt = usuario.createdAt;
    return dto;
  }
}
