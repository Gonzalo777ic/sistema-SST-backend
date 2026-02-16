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
  Capacitacion = 'Capacitación',
  CapacitacionObligatoria = 'Capacitación obligatoria',
  Charla = 'Charla',
  Charla5Minutos = 'Charla 5 minutos',
  CharlaSST = 'Charla de seguridad y salud en el trabajo',
  PausasActivas = 'Pausas activas',
  SimulacroEmergencia = 'Simulacro de emergencia',
  TomaConsciencia = 'Toma de consciencia',
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
  Pendiente = 'PENDIENTE',
  Programada = 'PROGRAMADA',
  Completada = 'COMPLETADA',
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

  @Column({ type: 'varchar', length: 500, nullable: true })
  lugar: string | null;

  @Column({
    type: 'enum',
    enum: TipoCapacitacion,
  })
  tipo: TipoCapacitacion;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date | null;

  @Column({ name: 'sede', type: 'varchar', length: 200, nullable: true })
  sede: string | null;

  @Column({ name: 'unidad', type: 'varchar', length: 200, nullable: true })
  unidad: string | null;

  @Column({ name: 'area', type: 'varchar', length: 200, nullable: true })
  area: string | null;

  @Column({ name: 'grupo', type: 'varchar', length: 100, nullable: true })
  grupo: string | null;

  @Column({ name: 'instrucciones', type: 'jsonb', nullable: true })
  instrucciones: { id: string; descripcion: string; esEvaluacion: boolean; imagenUrl?: string; firmaRegistro?: boolean }[] | null;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  horaInicio: string | null;

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  horaFin: string | null;

  @Column({ name: 'duracion_horas', type: 'decimal', precision: 4, scale: 2, nullable: true })
  duracionHoras: number | null;

  @Column({ name: 'duracion_minutos', type: 'int', nullable: true })
  duracionMinutos: number | null;

  @Column({
    type: 'enum',
    enum: EstadoCapacitacion,
    default: EstadoCapacitacion.Pendiente,
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

  @Column({ name: 'firma_capacitador_url', type: 'text', nullable: true })
  firmaCapacitadorUrl: string | null;

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
