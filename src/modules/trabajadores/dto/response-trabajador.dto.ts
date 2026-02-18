import {
  EstadoTrabajador,
  GrupoSanguineo,
  TipoDocumento,
} from '../entities/trabajador.entity';

export class ResponseTrabajadorDto {
  id: string;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  nombre_completo: string;
  tipo_documento: TipoDocumento | null;
  numero_documento: string | null;
  documento_identidad: string;
  cargo: string;
  area_id: string | null;
  area_nombre?: string | null;
  telefono: string | null;
  email_personal: string | null;
  email_corporativo: string | null;
  fecha_ingreso: string;
  estado: EstadoTrabajador;
  grupo_sanguineo: GrupoSanguineo | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  foto_url: string | null;
  firma_digital_url: string | null;
  talla_casco: string | null;
  talla_camisa: string | null;
  talla_pantalon: string | null;
  talla_calzado: number | null;
  perfil_completado: boolean;
  empresa_id: string;
  empresa_nombre?: string | null;
  acceso_todas_empresas?: boolean;
  usuario_id: string | null;
  sede: string | null;
  unidad: string | null;
  jefe_directo: string | null;
  centro_costos: string | null;
  nivel_exposicion: string | null;
  tipo_usuario: string | null;
  seguro_atencion_medica: string | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
  pais: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  direccion: string | null;
  modalidad_contrato: string | null;
  gerencia: string | null;
  puesto_capacitacion: string | null;
  protocolos_emo: string | null;
  cmp: string | null;
  rne: string | null;
  sello_url: string | null;
  titulo_sello: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(t: {
    id: string;
    nombres: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    nombreCompleto: string;
    tipoDocumento: TipoDocumento | null;
    numeroDocumento: string | null;
    documentoIdentidad: string;
    cargo: string;
    areaId: string | null;
    area?: { nombre: string } | null;
    telefono: string | null;
    emailPersonal: string | null;
    emailCorporativo: string | null;
    fechaIngreso: Date;
    estado: EstadoTrabajador;
    grupoSanguineo: GrupoSanguineo | null;
    contactoEmergenciaNombre: string | null;
    contactoEmergenciaTelefono: string | null;
    fotoUrl: string | null;
    firmaDigitalUrl: string | null;
    tallaCasco: string | null;
    tallaCamisa: string | null;
    tallaPantalon: string | null;
    tallaCalzado: number | null;
    perfilCompletado: boolean;
    empresaId: string;
    accesoTodasEmpresas?: boolean;
    empresa?: { nombre: string } | null;
    usuario?: { id: string } | null;
    sede: string | null;
    unidad: string | null;
    jefeDirecto: string | null;
    centroCostos: string | null;
    nivelExposicion: string | null;
    tipoUsuario: string | null;
    seguroAtencionMedica: string | null;
    fechaNacimiento: Date | null;
    sexo: string | null;
    pais: string | null;
    departamento: string | null;
    provincia: string | null;
    distrito: string | null;
    direccion: string | null;
    modalidadContrato: string | null;
    gerencia: string | null;
    puestoCapacitacion: string | null;
    protocolosEmo: string | null;
    cmp?: string | null;
    rne?: string | null;
    selloUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseTrabajadorDto {
    const dto = new ResponseTrabajadorDto();
    dto.id = t.id;
    dto.nombres = t.nombres;
    dto.apellido_paterno = t.apellidoPaterno;
    dto.apellido_materno = t.apellidoMaterno;
    dto.nombre_completo = t.nombreCompleto;
    dto.tipo_documento = t.tipoDocumento;
    dto.numero_documento = t.numeroDocumento;
    dto.documento_identidad = t.documentoIdentidad;
    dto.cargo = t.cargo;
    dto.area_id = t.areaId ?? null;
    dto.area_nombre = t.area?.nombre ?? null;
    dto.telefono = t.telefono;
    dto.email_personal = t.emailPersonal;
    dto.email_corporativo = t.emailCorporativo;
    dto.fecha_ingreso =
      t.fechaIngreso instanceof Date
        ? t.fechaIngreso.toISOString().split('T')[0]
        : String(t.fechaIngreso);
    dto.estado = t.estado;
    dto.grupo_sanguineo = t.grupoSanguineo;
    dto.contacto_emergencia_nombre = t.contactoEmergenciaNombre;
    dto.contacto_emergencia_telefono = t.contactoEmergenciaTelefono;
    dto.foto_url = t.fotoUrl;
    dto.firma_digital_url = t.firmaDigitalUrl;
    dto.talla_casco = t.tallaCasco;
    dto.talla_camisa = t.tallaCamisa;
    dto.talla_pantalon = t.tallaPantalon;
    dto.talla_calzado = t.tallaCalzado;
    dto.perfil_completado = t.perfilCompletado;
    dto.empresa_id = t.empresaId;
    dto.acceso_todas_empresas = (t as any).accesoTodasEmpresas ?? false;
    dto.empresa_nombre = t.empresa?.nombre ?? null;
    dto.usuario_id = t.usuario?.id ?? null;
    dto.sede = t.sede;
    dto.unidad = t.unidad;
    dto.jefe_directo = t.jefeDirecto;
    dto.centro_costos = t.centroCostos;
    dto.nivel_exposicion = t.nivelExposicion;
    dto.tipo_usuario = t.tipoUsuario;
    dto.seguro_atencion_medica = t.seguroAtencionMedica;
    dto.fecha_nacimiento =
      t.fechaNacimiento instanceof Date
        ? t.fechaNacimiento.toISOString().split('T')[0]
        : t.fechaNacimiento
          ? String(t.fechaNacimiento).split('T')[0]
          : null;
    dto.sexo = t.sexo;
    dto.pais = t.pais;
    dto.departamento = t.departamento;
    dto.provincia = t.provincia;
    dto.distrito = t.distrito;
    dto.direccion = t.direccion;
    dto.modalidad_contrato = t.modalidadContrato;
    dto.gerencia = t.gerencia;
    dto.puesto_capacitacion = t.puestoCapacitacion;
    dto.protocolos_emo = t.protocolosEmo;
    dto.cmp = (t as any).cmp ?? null;
    dto.rne = (t as any).rne ?? null;
    dto.sello_url = (t as any).selloUrl ?? null;
    dto.titulo_sello = (t as any).tituloSello ?? null;
    dto.createdAt = t.createdAt;
    dto.updatedAt = t.updatedAt;
    return dto;
  }
}
