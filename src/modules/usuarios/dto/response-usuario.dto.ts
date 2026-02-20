import { AuthProvider, UsuarioRol } from '../entities/usuario.entity';

export interface TrabajadorInfo {
  id: string;
  nombreCompleto: string;
  documentoIdentidad: string;
  estado: string;
}

export interface ParticipacionCentroInfo {
  id: string;
  centroMedicoId: string;
  centroMedicoNombre: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string | null;
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
  centroMedicoId: string | null;
  centroMedicoNombre: string | null;
  participacionesCentroMedico?: ParticipacionCentroInfo[];
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
    participacionesCentroMedico?: Array<{
      id: string;
      centroMedicoId: string;
      estado: string;
      fechaInicio: Date;
      fechaFin: Date | null;
      centroMedico?: { nombre: string } | null;
    }> | null;
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
    const participaciones = (usuario as any).participacionesCentroMedico as Array<{ centroMedicoId: string; centroMedico?: { nombre: string }; estado: string }> | undefined;
    const participacionActiva = participaciones?.find((p) => p.estado === 'activo');
    dto.centroMedicoId = (usuario as any).centroMedicoId ?? participacionActiva?.centroMedicoId ?? null;
    dto.centroMedicoNombre = (usuario as any).centroMedico?.nombre ?? participacionActiva?.centroMedico?.nombre ?? null;
    dto.participacionesCentroMedico = participaciones
      ?.filter((p) => p.estado === 'activo')
      .map((p) => ({
        id: (p as any).id,
        centroMedicoId: p.centroMedicoId,
        centroMedicoNombre: p.centroMedico?.nombre ?? '',
        estado: p.estado,
        fechaInicio: (p as any).fechaInicio?.toISOString?.()?.split?.('T')?.[0] ?? '',
        fechaFin: (p as any).fechaFin?.toISOString?.()?.split?.('T')?.[0] ?? null,
      })) ?? [];
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
