import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Area } from '../../empresas/entities/area.entity';

export enum TipoIncidente {
  Accidente = 'Accidente',
  Incidente = 'Incidente',
  CasiAccidente = 'Casi-Accidente',
  EnfermedadOcupacional = 'Enfermedad Ocupacional',
}

export enum SeveridadIncidente {
  Leve = 'Leve',
  Moderado = 'Moderado',
  Grave = 'Grave',
  Fatal = 'Fatal',
}

export enum EstadoIncidente {
  Reportado = 'Reportado',
  EnInvestigacion = 'En Investigación',
  AccionesEnCurso = 'Acciones en Curso',
  Cerrado = 'Cerrado',
}

@Entity('incidentes')
export class Incidente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TipoIncidente,
  })
  tipo: TipoIncidente;

  @Column({
    type: 'enum',
    enum: SeveridadIncidente,
  })
  severidad: SeveridadIncidente;

  @Column({ name: 'fecha_hora', type: 'timestamptz' })
  fechaHora: Date;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'parte_cuerpo_afectada', type: 'text', nullable: true })
  parteCuerpoAfectada: string | null;

  @Column({ name: 'dias_perdidos', type: 'int', default: 0 })
  diasPerdidos: number;

  @Column({ type: 'simple-array', nullable: true })
  fotos: string[] | null;

  @Column({ type: 'text', nullable: true })
  causas: string | null;

  @Column({ name: 'acciones_inmediatas', type: 'text', nullable: true })
  accionesInmediatas: string | null;

  @Column({ type: 'jsonb', nullable: true })
  testigos: Array<{ nombre: string; documento?: string; contacto?: string }> | null;

  @Column({ name: 'acciones_correctivas', type: 'text', nullable: true })
  accionesCorrectivas: string | null;

  @Column({
    type: 'enum',
    enum: EstadoIncidente,
    default: EstadoIncidente.Reportado,
  })
  estado: EstadoIncidente;

  @Column({ name: 'area_trabajo', type: 'varchar' })
  areaTrabajo: string;

  @Column({ name: 'codigo_correlativo', type: 'varchar', length: 50, nullable: true })
  codigoCorrelativo: string | null;

  // Snapshot del trabajador afectado (para auditoría histórica)
  @Column({ name: 'nombre_trabajador_snapshot', type: 'varchar', nullable: true })
  nombreTrabajadorSnapshot: string | null;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'trabajador_afectado_id', type: 'uuid', nullable: true })
  trabajadorAfectadoId: string | null;

  @ManyToOne(() => Trabajador, { nullable: true })
  @JoinColumn({ name: 'trabajador_afectado_id' })
  trabajadorAfectado: Trabajador | null;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area | null;

  @Column({ name: 'responsable_investigacion_id', type: 'uuid', nullable: true })
  responsableInvestigacionId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'responsable_investigacion_id' })
  responsableInvestigacion: Usuario | null;

  @Column({ name: 'reportado_por_id', type: 'uuid' })
  reportadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reportado_por_id' })
  reportadoPor: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
