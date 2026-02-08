import { EstadoTrabajador, GrupoSanguineo } from '../entities/trabajador.entity';

export class ResponseTrabajadorDto {
  id: string;
  nombre_completo: string;
  documento_identidad: string;
  cargo: string;
  area_id: string | null;
  telefono: string | null;
  email_personal: string | null;
  fecha_ingreso: string;
  estado: EstadoTrabajador;
  grupo_sanguineo: GrupoSanguineo | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  foto_url: string | null;
  empresa_id: string;
  usuario_id: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(t: {
    id: string;
    nombreCompleto: string;
    documentoIdentidad: string;
    cargo: string;
    areaId: string | null;
    telefono: string | null;
    emailPersonal: string | null;
    fechaIngreso: Date;
    estado: EstadoTrabajador;
    grupoSanguineo: GrupoSanguineo | null;
    contactoEmergenciaNombre: string | null;
    contactoEmergenciaTelefono: string | null;
    fotoUrl: string | null;
    empresaId: string;
    usuario?: { id: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseTrabajadorDto {
    const dto = new ResponseTrabajadorDto();
    dto.id = t.id;
    dto.nombre_completo = t.nombreCompleto;
    dto.documento_identidad = t.documentoIdentidad;
    dto.cargo = t.cargo;
    dto.area_id = t.areaId ?? null;
    dto.telefono = t.telefono;
    dto.email_personal = t.emailPersonal;
    dto.fecha_ingreso = t.fechaIngreso instanceof Date
      ? t.fechaIngreso.toISOString().split('T')[0]
      : String(t.fechaIngreso);
    dto.estado = t.estado;
    dto.grupo_sanguineo = t.grupoSanguineo;
    dto.contacto_emergencia_nombre = t.contactoEmergenciaNombre;
    dto.contacto_emergencia_telefono = t.contactoEmergenciaTelefono;
    dto.foto_url = t.fotoUrl;
    dto.empresa_id = t.empresaId;
    dto.usuario_id = t.usuario?.id ?? null;
    dto.createdAt = t.createdAt;
    dto.updatedAt = t.updatedAt;
    return dto;
  }
}
