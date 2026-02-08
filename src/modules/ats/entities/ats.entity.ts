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
import { AtsPersonalInvolucrado } from './ats-personal-involucrado.entity';
import { AtsPasoTrabajo } from './ats-paso-trabajo.entity';

export enum EstadoATS {
  Borrador = 'Borrador',
  Completado = 'Completado',
  Aprobado = 'Aprobado',
  EnEjecucion = 'En Ejecución',
  Finalizado = 'Finalizado',
}

@Entity('ats')
export class ATS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_ats', type: 'varchar', unique: true })
  numeroAts: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar' })
  area: string;

  @Column({ type: 'varchar', nullable: true })
  ubicacion: string | null;

  @Column({
    type: 'enum',
    enum: EstadoATS,
    default: EstadoATS.Borrador,
  })
  estado: EstadoATS;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  horaInicio: string | null;

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  horaFin: string | null;

  @Column({ name: 'fecha_aprobacion', type: 'timestamptz', nullable: true })
  fechaAprobacion: Date | null;

  @Column({ name: 'trabajo_a_realizar', type: 'text' })
  trabajoARealizar: string;

  @Column({ name: 'herramientas_equipos', type: 'text', nullable: true })
  herramientasEquipos: string | null;

  @Column({ name: 'condiciones_climaticas', type: 'text', nullable: true })
  condicionesClimaticas: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ name: 'epp_requerido', type: 'simple-array', nullable: true })
  eppRequerido: string[] | null;

  // Permisos especiales
  @Column({ name: 'trabajo_altura', default: false })
  trabajoAltura: boolean;

  @Column({ name: 'trabajo_caliente', default: false })
  trabajoCaliente: boolean;

  @Column({ name: 'espacio_confinado', default: false })
  espacioConfinado: boolean;

  @Column({ default: false })
  excavacion: boolean;

  @Column({ name: 'energia_electrica', default: false })
  energiaElectrica: boolean;

  // Firmas
  @Column({ name: 'firma_elaborador', type: 'varchar', nullable: true })
  firmaElaborador: string | null;

  @Column({ name: 'firma_supervisor_url', type: 'varchar', nullable: true })
  firmaSupervisorUrl: string | null;

  @Column({ name: 'pdf_url', type: 'varchar', nullable: true })
  pdfUrl: string | null;

  @Column({ name: 'historial_versiones', type: 'jsonb', nullable: true })
  historialVersiones: any[] | null;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'elaborado_por_id', type: 'uuid' })
  elaboradoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'elaborado_por_id' })
  elaboradoPor: Usuario;

  @Column({ name: 'supervisor_id', type: 'uuid', nullable: true })
  supervisorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Usuario | null;

  @Column({ name: 'aprobado_por_id', type: 'uuid', nullable: true })
  aprobadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'aprobado_por_id' })
  aprobadoPor: Usuario | null;

  @OneToMany(() => AtsPersonalInvolucrado, (personal) => personal.ats, {
    cascade: true,
  })
  personalInvolucrado: AtsPersonalInvolucrado[];

  @OneToMany(() => AtsPasoTrabajo, (paso) => paso.ats, {
    cascade: true,
  })
  pasosTrabajo: AtsPasoTrabajo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
