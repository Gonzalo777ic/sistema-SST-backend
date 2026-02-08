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
import { PetarTrabajador } from './petar-trabajador.entity';

export enum TipoTrabajoPETAR {
  TrabajoAltura = 'Trabajo en Altura',
  EspacioConfinado = 'Espacio Confinado',
  TrabajosCaliente = 'Trabajos en Caliente',
  IzajeCargas = 'Izaje de Cargas',
  TrabajosElectricos = 'Trabajos Eléctricos',
  Excavaciones = 'Excavaciones',
  Otro = 'Otro',
}

export enum EstadoPETAR {
  Borrador = 'Borrador',
  PendienteAprobacion = 'Pendiente de Aprobación',
  Aprobado = 'Aprobado',
  EnEjecucion = 'En Ejecución',
  Cerrado = 'Cerrado',
  Anulado = 'Anulado',
}

@Entity('petar')
export class PETAR {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  codigo: string;

  @Column({
    name: 'tipo_trabajo',
    type: 'enum',
    enum: TipoTrabajoPETAR,
  })
  tipoTrabajo: TipoTrabajoPETAR;

  @Column({ name: 'descripcion_tarea', type: 'text' })
  descripcionTarea: string;

  @Column({ type: 'varchar' })
  area: string;

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz' })
  fechaFin: Date;

  @Column({
    type: 'enum',
    enum: EstadoPETAR,
    default: EstadoPETAR.Borrador,
  })
  estado: EstadoPETAR;

  @Column({ name: 'equipos_herramientas', type: 'text', nullable: true })
  equiposHerramientas: string | null;

  @Column({ name: 'epp_requerido', type: 'simple-array', nullable: true })
  eppRequerido: string[] | null;

  @Column({ name: 'condiciones_previas', type: 'jsonb', nullable: true })
  condicionesPrevias: Array<{ condicion: string; verificado: boolean }> | null;

  @Column({ name: 'checklist_verificacion', type: 'jsonb', nullable: true })
  checklistVerificacion: Array<{
    item: string;
    cumple: boolean;
    observacion: string;
  }> | null;

  @Column({ type: 'jsonb', nullable: true })
  peligros: Array<{
    peligro: string;
    riesgo: string;
    nivel_inicial: string;
    medida_control: string;
    nivel_residual: string;
  }> | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // Firmas y responsables
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

  @Column({ name: 'firma_sst_url', type: 'varchar', nullable: true })
  firmaSstUrl: string | null;

  @Column({ name: 'fecha_firma_sst', type: 'timestamptz', nullable: true })
  fechaFirmaSst: Date | null;

  @Column({ name: 'empresa_contratista_id', type: 'uuid', nullable: true })
  empresaContratistaId: string | null;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'creado_por_id', type: 'uuid' })
  creadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Usuario;

  @OneToMany(() => PetarTrabajador, (trabajador) => trabajador.petar, {
    cascade: true,
  })
  trabajadores: PetarTrabajador[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
