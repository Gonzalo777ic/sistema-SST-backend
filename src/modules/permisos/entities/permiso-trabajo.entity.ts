import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Area } from '../../empresas/entities/area.entity';
import { TrabajadorPermiso } from './trabajador-permiso.entity';

export enum TipoPermiso {
  ATS = 'ATS',
  PETAR = 'PETAR',
  IPERC = 'IPERC',
  TrabajoCaliente = 'Trabajo en Caliente',
  TrabajoAltura = 'Trabajo en Altura',
  EspacioConfinado = 'Espacio Confinado',
  Excavaciones = 'Excavaciones',
}

export enum EstadoPermiso {
  Borrador = 'Borrador',
  PendienteAprobacion = 'Pendiente Aprobación',
  Aprobado = 'Aprobado',
  EnEjecucion = 'En Ejecución',
  Completado = 'Completado',
  Cancelado = 'Cancelado',
}

@Entity('permisos_trabajo')
export class PermisoTrabajo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_permiso', type: 'varchar', unique: true })
  numeroPermiso: string;

  @Column({
    name: 'tipo_permiso',
    type: 'enum',
    enum: TipoPermiso,
  })
  tipoPermiso: TipoPermiso;

  @Column({
    type: 'enum',
    enum: EstadoPermiso,
    default: EstadoPermiso.Borrador,
  })
  estado: EstadoPermiso;

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz' })
  fechaFin: Date;

  @Column({ name: 'ubicacion_especifica', type: 'varchar' })
  ubicacionEspecifica: string;

  @Column({ name: 'descripcion_trabajo', type: 'text' })
  descripcionTrabajo: string;

  @Column({ name: 'epp_requerido', type: 'simple-array', nullable: true })
  eppRequerido: string[] | null;

  @Column({ name: 'herramientas_equipos', type: 'text', nullable: true })
  herramientasEquipos: string | null;

  @Column({ name: 'peligros_identificados', type: 'jsonb', nullable: true })
  peligrosIdentificados: Array<{
    peligro: string;
    riesgo: string;
    medida_control: string;
  }> | null;

  @Column({ name: 'fotos_evidencia', type: 'simple-array', nullable: true })
  fotosEvidencia: string[] | null;

  // Firmas
  @Column({ name: 'supervisor_responsable_id', type: 'uuid' })
  supervisorResponsableId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supervisor_responsable_id' })
  supervisorResponsable: Usuario;

  @Column({ name: 'firma_supervisor_url', type: 'varchar', nullable: true })
  firmaSupervisorUrl: string | null;

  @Column({ name: 'fecha_firma_supervisor', type: 'timestamptz', nullable: true })
  fechaFirmaSupervisor: Date | null;

  @Column({ name: 'aprobador_sst_id', type: 'uuid', nullable: true })
  aprobadorSstId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'aprobador_sst_id' })
  aprobadorSst: Usuario | null;

  @Column({ name: 'firma_aprobador_url', type: 'varchar', nullable: true })
  firmaAprobadorUrl: string | null;

  @Column({ name: 'fecha_aprobacion', type: 'timestamptz', nullable: true })
  fechaAprobacion: Date | null;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'area_trabajo_id', type: 'uuid', nullable: true })
  areaTrabajoId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_trabajo_id' })
  areaTrabajo: Area | null;

  @Column({ name: 'creado_por_id', type: 'uuid' })
  creadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Usuario;

  @OneToMany(() => TrabajadorPermiso, (trabajador) => trabajador.permiso, {
    cascade: true,
  })
  trabajadores: TrabajadorPermiso[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
