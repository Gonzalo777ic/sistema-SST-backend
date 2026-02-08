import { AuthProvider, UsuarioRol } from '../entities/usuario.entity';

export class ResponseUsuarioDto {
  id: string;
  email: string;
  authProvider: AuthProvider;
  roles: UsuarioRol[];
  activo: boolean;
  ultimoAcceso: Date | null;
  empresaId: string | null;
  trabajadorId: string | null;
  createdAt: Date;

  static fromEntity(usuario: {
    id: string;
    email: string;
    authProvider: AuthProvider;
    roles: UsuarioRol[];
    activo: boolean;
    ultimoAcceso: Date | null;
    empresaId: string | null;
    trabajador?: { id: string } | null;
    createdAt: Date;
  }): ResponseUsuarioDto {
    const dto = new ResponseUsuarioDto();
    dto.id = usuario.id;
    dto.email = usuario.email;
    dto.authProvider = usuario.authProvider;
    dto.roles = usuario.roles;
    dto.activo = usuario.activo;
    dto.ultimoAcceso = usuario.ultimoAcceso;
    dto.empresaId = usuario.empresaId;
    dto.trabajadorId = usuario.trabajador?.id ?? null;
    dto.createdAt = usuario.createdAt;
    return dto;
  }
}
