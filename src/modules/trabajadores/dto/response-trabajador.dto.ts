import { EstadoTrabajador, GrupoSanguineo } from '../entities/trabajador.entity';

export class ResponseTrabajadorDto {
  id: string;
  nombre_completo: string;
  documento_identidad: string;
  cargo: string;
  area_id: string | null;
  area_nombre?: string | null;
  telefono: string | null;
  email_personal: string | null;
  fecha_ingreso: string;
  estado: EstadoTrabajador;
  grupo_sanguineo: GrupoSanguineo | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  foto_url: string | null;
  talla_casco: string | null;
  talla_camisa: string | null;
  talla_pantalon: string | null;
  talla_calzado: number | null;
  perfil_completado: boolean;
  empresa_id: string;
  empresa_nombre?: string | null;
  usuario_id: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(t: {
    id: string;
    nombreCompleto: string;
    documentoIdentidad: string;
    cargo: string;
    areaId: string | null;
    area?: { nombre: string } | null;
    telefono: string | null;
    emailPersonal: string | null;
    fechaIngreso: Date;
    estado: EstadoTrabajador;
    grupoSanguineo: GrupoSanguineo | null;
    contactoEmergenciaNombre: string | null;
    contactoEmergenciaTelefono: string | null;
    fotoUrl: string | null;
    tallaCasco: string | null;
    tallaCamisa: string | null;
    tallaPantalon: string | null;
    tallaCalzado: number | null;
    perfilCompletado: boolean;
    empresaId: string;
    empresa?: { nombre: string } | null;
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
    dto.area_nombre = t.area?.nombre ?? null;
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
    dto.talla_casco = t.tallaCasco;
    dto.talla_camisa = t.tallaCamisa;
    dto.talla_pantalon = t.tallaPantalon;
    dto.talla_calzado = t.tallaCalzado;
    dto.perfil_completado = t.perfilCompletado;
    dto.empresa_id = t.empresaId;
    dto.empresa_nombre = t.empresa?.nombre ?? null;
    dto.usuario_id = t.usuario?.id ?? null;
    dto.createdAt = t.createdAt;
    dto.updatedAt = t.updatedAt;
    return dto;
  }
}
