import { AuthProvider, UsuarioRol } from '../entities/usuario.entity';

export interface TrabajadorInfo {
  id: string;
  nombreCompleto: string;
  documentoIdentidad: string;
  estado: string;
}

export class ResponseUsuarioDto {
  id: string;
  dni: string;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  firma_url: string | null;
  authProvider: AuthProvider;
  roles: UsuarioRol[];
  activo: boolean;
  debe_cambiar_password: boolean;
  ultimoAcceso: Date | null;
  empresaId: string | null;
  trabajadorId: string | null;
  trabajador?: TrabajadorInfo | null;
  perfil_completado?: boolean;
  createdAt: Date;

  static fromEntity(usuario: {
    id: string;
    dni: string;
    nombres?: string | null;
    apellidoPaterno?: string | null;
    apellidoMaterno?: string | null;
    firmaUrl?: string | null;
    perfilCompletado?: boolean;
    authProvider: AuthProvider;
    roles: UsuarioRol[];
    activo: boolean;
    debeCambiarPassword: boolean;
    ultimoAcceso: Date | null;
    empresaId: string | null;
    trabajador?: {
      id: string;
      nombreCompleto?: string;
      documentoIdentidad?: string;
      estado?: string;
      perfilCompletado?: boolean;
    } | null;
    createdAt: Date;
  }): ResponseUsuarioDto {
    const dto = new ResponseUsuarioDto();
    dto.id = usuario.id;
    dto.dni = usuario.dni;
    dto.nombres = (usuario as any).nombres ?? null;
    dto.apellido_paterno = (usuario as any).apellidoPaterno ?? null;
    dto.apellido_materno = (usuario as any).apellidoMaterno ?? null;
    dto.firma_url = (usuario as any).firmaUrl ?? null;
    dto.authProvider = usuario.authProvider;
    dto.roles = usuario.roles;
    dto.activo = usuario.activo;
    dto.debe_cambiar_password = usuario.debeCambiarPassword;
    dto.ultimoAcceso = usuario.ultimoAcceso;
    dto.empresaId = usuario.empresaId;
    dto.trabajadorId = usuario.trabajador?.id ?? null;
    dto.perfil_completado = usuario.trabajador
      ? usuario.trabajador.perfilCompletado ?? false
      : (usuario as any).perfilCompletado ?? false;
    
    // Incluir información del trabajador si está disponible
    // TypeORM devuelve los campos en camelCase según la entidad
    if (usuario.trabajador) {
      const trabajador = usuario.trabajador as any;
      if (trabajador.nombreCompleto || trabajador.id) {
        dto.trabajador = {
          id: trabajador.id,
          nombreCompleto: trabajador.nombreCompleto || '',
          documentoIdentidad: trabajador.documentoIdentidad || '',
          estado: trabajador.estado || '',
        };
      }
    }
    
    dto.createdAt = usuario.createdAt;
    return dto;
  }
}
