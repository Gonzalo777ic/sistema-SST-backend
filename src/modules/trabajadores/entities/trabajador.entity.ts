import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Area } from '../../empresas/entities/area.entity';
import { Cargo } from '../../cargos/entities/cargo.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoDocumento {
  DNI = 'DNI',
  CARNE_EXTRANJERIA = 'CARNE_EXTRANJERIA',
  PASAPORTE = 'PASAPORTE',
}

export enum EstadoTrabajador {
  Activo = 'Activo',
  Inactivo = 'Inactivo',
  Vacaciones = 'Vacaciones',
  Licencia = 'Licencia',
}

export enum GrupoSanguineo {
  'A+' = 'A+',
  'A-' = 'A-',
  'B+' = 'B+',
  'B-' = 'B-',
  'AB+' = 'AB+',
  'AB-' = 'AB-',
  'O+' = 'O+',
  'O-' = 'O-',
}

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO',
}

export enum EstadoCivil {
  Soltero = 'Soltero',
  Casado = 'Casado',
  Conviviente = 'Conviviente',
  Divorciado = 'Divorciado',
  Viudo = 'Viudo',
  Otro = 'Otro',
}

export enum GradoInstruccion {
  SinEstudios = 'Sin Estudios',
  Primaria = 'Primaria',
  Secundaria = 'Secundaria',
  Tecnico = 'Técnico',
  Superior = 'Superior',
  SuperiorCompleta = 'Superior Completa',
  Posgrado = 'Posgrado',
  Otro = 'Otro',
}

@Entity('trabajadores')
@Unique(['documentoIdentidad', 'empresaId'])
export class Trabajador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Datos personales - nombres separados (nullable para migración de datos existentes)
  @Column({ name: 'nombres', type: 'varchar', nullable: true })
  nombres: string | null;

  @Column({ name: 'apellido_paterno', type: 'varchar', nullable: true })
  apellidoPaterno: string | null;

  @Column({ name: 'apellido_materno', type: 'varchar', nullable: true })
  apellidoMaterno: string | null;

  @Column({ name: 'nombre_completo' })
  nombreCompleto: string;

  // Documento de identidad (documento_identidad = numero_documento para Usuario.dni y legacy)
  @Column({
    name: 'tipo_documento',
    type: 'enum',
    enum: TipoDocumento,
    nullable: true,
  })
  tipoDocumento: TipoDocumento | null;

  @Column({ name: 'numero_documento', type: 'varchar', nullable: true })
  numeroDocumento: string | null;

  @Column({ name: 'documento_identidad' })
  documentoIdentidad: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento: Date | null;

  @Column({ type: 'enum', enum: Sexo, nullable: true })
  sexo: Sexo | null;

  @Column({ name: 'foto_url', type: 'varchar', nullable: true })
  fotoUrl: string | null;

  @Column({ name: 'firma_digital_url', type: 'varchar', nullable: true })
  firmaDigitalUrl: string | null;

  @Column({ name: 'email_personal', type: 'varchar', nullable: true })
  emailPersonal: string | null;

  @Column({ name: 'email_corporativo', type: 'varchar', nullable: true })
  emailCorporativo: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', nullable: true })
  pais: string | null;

  @Column({ type: 'varchar', nullable: true })
  departamento: string | null;

  @Column({ type: 'varchar', nullable: true })
  provincia: string | null;

  @Column({ type: 'varchar', nullable: true })
  distrito: string | null;

  @Column({ type: 'varchar', nullable: true })
  direccion: string | null;

  @Column({ name: 'numero_interior', type: 'varchar', length: 100, nullable: true })
  numeroInterior: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  urbanizacion: string | null;

  /** Reside en el mismo lugar donde trabaja (ej. campamento minero) */
  @Column({ name: 'reside_en_lugar_trabajo', type: 'boolean', nullable: true })
  resideEnLugarTrabajo: boolean | null;

  /** Años de residencia en lugar de trabajo */
  @Column({ name: 'tiempo_residencia_lugar_trabajo', type: 'varchar', length: 20, nullable: true })
  tiempoResidenciaLugarTrabajo: string | null;

  @Column({ name: 'estado_civil', type: 'enum', enum: EstadoCivil, nullable: true })
  estadoCivil: EstadoCivil | null;

  @Column({ name: 'grado_instruccion', type: 'enum', enum: GradoInstruccion, nullable: true })
  gradoInstruccion: GradoInstruccion | null;

  @Column({ name: 'nro_hijos_vivos', type: 'int', nullable: true })
  nroHijosVivos: number | null;

  @Column({ name: 'nro_dependientes', type: 'int', nullable: true })
  nroDependientes: number | null;

  @Column({ name: 'seguro_essalud', type: 'boolean', nullable: true })
  seguroEssalud: boolean | null;

  @Column({ name: 'seguro_eps', type: 'boolean', nullable: true })
  seguroEps: boolean | null;

  @Column({ name: 'seguro_sctr', type: 'boolean', nullable: true })
  seguroSctr: boolean | null;

  @Column({ name: 'seguro_otro', type: 'varchar', length: 200, nullable: true })
  seguroOtro: string | null;

  // Contacto de emergencia
  @Column({ name: 'contacto_emergencia_nombre', type: 'varchar', nullable: true })
  contactoEmergenciaNombre: string | null;

  @Column({ name: 'contacto_emergencia_telefono', type: 'varchar', nullable: true })
  contactoEmergenciaTelefono: string | null;

  // Datos laborales
  @Column({ name: 'cargo', type: 'varchar', nullable: true })
  cargo: string | null;

  @Column({ name: 'cargo_id', type: 'uuid', nullable: true })
  cargoId: string | null;

  @ManyToOne(() => Cargo, { nullable: true })
  @JoinColumn({ name: 'cargo_id' })
  cargoRef: Cargo | null;

  @Column({ name: 'jefe_directo', type: 'varchar', nullable: true })
  jefeDirecto: string | null;

  @Column({ name: 'sede', type: 'varchar', nullable: true })
  sede: string | null;

  @Column({ name: 'unidad', type: 'varchar', nullable: true })
  unidad: string | null;

  @Column({ name: 'centro_costos', type: 'varchar', nullable: true })
  centroCostos: string | null;

  @Column({ name: 'nivel_exposicion', type: 'varchar', nullable: true })
  nivelExposicion: string | null;

  @Column({ name: 'tipo_usuario', type: 'varchar', nullable: true })
  tipoUsuario: string | null;

  @Column({ name: 'seguro_atencion_medica', type: 'varchar', nullable: true })
  seguroAtencionMedica: string | null;

  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso: Date;

  @Column({ name: 'modalidad_contrato', type: 'varchar', nullable: true })
  modalidadContrato: string | null;

  @Column({ type: 'varchar', nullable: true })
  gerencia: string | null;

  @Column({ name: 'puesto_capacitacion', type: 'varchar', nullable: true })
  puestoCapacitacion: string | null;

  @Column({ name: 'protocolos_emo', type: 'varchar', nullable: true })
  protocolosEmo: string | null;

  /** Médico Ocupacional: número de colegiatura (CMP) */
  @Column({ name: 'cmp', type: 'varchar', length: 20, nullable: true })
  cmp: string | null;

  /** Médico Ocupacional: registro nacional de especialistas (RNE) */
  @Column({ name: 'rne', type: 'varchar', length: 30, nullable: true })
  rne: string | null;

  /** Médico Ocupacional: URL del sello digital en GCS */
  @Column({ name: 'sello_url', type: 'varchar', nullable: true })
  selloUrl: string | null;

  /** Médico Ocupacional: texto debajo del nombre en el sello (ej. MÉDICO OCUPACIONAL, o con especialidad) */
  @Column({ name: 'titulo_sello', type: 'varchar', length: 100, nullable: true })
  tituloSello: string | null;

  /** Médico Ocupacional: URL del logo para documentos (Cargo, Certificado, Carta). Si vacío, se muestra solo texto. */
  @Column({ name: 'logo_documentos_url', type: 'varchar', nullable: true })
  logoDocumentosUrl: string | null;

  /** Médico Ocupacional: si true, tiene acceso a todas las empresas del proyecto */
  @Column({ name: 'acceso_todas_empresas', type: 'boolean', default: false })
  accesoTodasEmpresas: boolean;

  @Column({
    type: 'enum',
    enum: EstadoTrabajador,
    default: EstadoTrabajador.Activo,
  })
  estado: EstadoTrabajador;

  @Column({
    name: 'grupo_sanguineo',
    type: 'enum',
    enum: GrupoSanguineo,
    nullable: true,
  })
  grupoSanguineo: GrupoSanguineo | null;

  @Column({ name: 'talla_casco', type: 'varchar', nullable: true })
  tallaCasco: string | null;

  @Column({ name: 'talla_camisa', type: 'varchar', nullable: true })
  tallaCamisa: string | null;

  @Column({ name: 'talla_pantalon', type: 'varchar', nullable: true })
  tallaPantalon: string | null;

  @Column({ name: 'talla_calzado', type: 'int', nullable: true })
  tallaCalzado: number | null;

  @Column({ name: 'talla_faja', type: 'varchar', nullable: true })
  tallaFaja: string | null;

  @Column({ name: 'talla_guantes_anticorte', type: 'varchar', nullable: true })
  tallaGuantesAnticorte: string | null;

  @Column({ name: 'talla_guantes_super_flex', type: 'varchar', nullable: true })
  tallaGuantesSuperFlex: string | null;

  @Column({ name: 'talla_guantes_nitrilo', type: 'varchar', nullable: true })
  tallaGuantesNitrilo: string | null;

  @Column({ name: 'talla_overol', type: 'varchar', nullable: true })
  tallaOverol: string | null;

  @Column({ name: 'perfil_completado', type: 'boolean', default: false })
  perfilCompletado: boolean;

  @Column({ name: 'kardex_pdf_url', type: 'text', nullable: true })
  kardexPdfUrl: string | null;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.trabajadores, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area | null;

  @OneToOne(() => Usuario, (usuario) => usuario.trabajador, { nullable: true })
  usuario: Usuario | null;

  @OneToMany('AntecedenteOcupacional', 'trabajador')
  antecedentesOcupacionales: import('../../antecedentes-ocupacionales/entities/antecedente-ocupacional.entity').AntecedenteOcupacional[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
