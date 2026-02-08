import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { AsistenciaCapacitacion } from './asistencia-capacitacion.entity';
import { ExamenCapacitacion } from './examen-capacitacion.entity'

export enum TipoCapacitacion {
  Induccion = 'Inducción',
  TrabajoAltura = 'Trabajo en Altura',
  EspaciosConfinados = 'Espacios Confinados',
  PrimerosAuxilios = 'Primeros Auxilios',
  ManejoEPP = 'Manejo de EPP',
  PrevencionIncendios = 'Prevención de Incendios',
  ManejoDefensivo = 'Manejo Defensivo',
  IzajeSenalizacion = 'Izaje y Señalización',
  RiesgosElectricos = 'Riesgos Eléctricos',
  Otra = 'Otra',
}

export enum EstadoCapacitacion {
  Programada = 'Programada',
  Completada = 'Completada',
  Cancelada = 'Cancelada',
}

@Entity('capacitaciones')
export class Capacitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  lugar: string;

  @Column({
    type: 'enum',
    enum: TipoCapacitacion,
  })
  tipo: TipoCapacitacion;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin: string;

  @Column({ name: 'duracion_horas', type: 'decimal', precision: 4, scale: 2 })
  duracionHoras: number;

  @Column({
    type: 'enum',
    enum: EstadoCapacitacion,
    default: EstadoCapacitacion.Programada,
  })
  estado: EstadoCapacitacion;

  @Column({ name: 'material_url', type: 'text', nullable: true })
  materialUrl: string | null;

  @Column({ name: 'certificado_url', type: 'text', nullable: true })
  certificadoUrl: string | null;

  @Column({ name: 'eliminado_por', type: 'varchar', nullable: true })
  eliminadoPor: string | null;

  @Column({ name: 'fecha_eliminacion', type: 'timestamptz', nullable: true })
  fechaEliminacion: Date | null;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: Usuario | null;

  @Column({ name: 'instructor_nombre', type: 'varchar', nullable: true })
  instructorNombre: string | null;

  @Column({ name: 'creado_por_id', type: 'uuid' })
  creadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Usuario;

  @OneToMany(() => AsistenciaCapacitacion, (asistencia) => asistencia.capacitacion, {
    cascade: true,
  })
  asistencias: AsistenciaCapacitacion[];

  @OneToMany(() => ExamenCapacitacion, (examen) => examen.capacitacion, {
    cascade: true,
  })
  examenes: ExamenCapacitacion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
