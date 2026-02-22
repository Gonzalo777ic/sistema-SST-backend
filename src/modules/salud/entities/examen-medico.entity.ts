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
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoExamen {
  Ingreso = 'Ingreso',
  Periodico = 'Periódico',
  PreOcupacional = 'Pre-Ocupacional',
  Retiro = 'Retiro',
  Reingreso = 'Reingreso',
  PorExposicion = 'Por Exposición',
  Otros = 'Otros',
  Reubicacion = 'Reubicación',
}

export enum ResultadoExamen {
  Apto = 'Apto',
  AptoConRestricciones = 'Apto con Restricciones',
  NoApto = 'No Apto',
  Pendiente = 'Pendiente',
}

export enum EstadoExamen {
  /** Estado inicial. La cita existe pero no hay evidencias aún. */
  Programado = 'Programado',
  /** El Centro Médico subió los resultados. Disparador para el médico ocupacional. */
  PruebasCargadas = 'Pruebas Cargadas',
  /** El Médico Ocupacional ya revisó, dio la aptitud y generó el certificado. */
  Completado = 'Completado',
  /** El trabajador ya recibió sus resultados y se tiene el cargo firmado (Cierre legal). */
  Entregado = 'Entregado',
  /** Se cambió la fecha original. Sirve para auditoría. */
  Reprogramado = 'Reprogramado',
  /** La cita no se dará (inasistencia o error). */
  Cancelado = 'Cancelado',
  /** Examen vencido (por fecha_vencimiento). */
  Vencido = 'Vencido',
  /** Por vencer (alerta). */
  PorVencer = 'Por Vencer',
}

@Entity('examenes_medicos')
export class ExamenMedico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tipo_examen',
    type: 'enum',
    enum: TipoExamen,
  })
  tipoExamen: TipoExamen;

  @Column({ name: 'centro_medico', type: 'varchar' })
  centroMedico: string;

  @Column({ name: 'medico_evaluador', type: 'varchar', nullable: true })
  medicoEvaluador: string | null;

  @Column({ name: 'hora_programacion', type: 'varchar', length: 10, nullable: true })
  horaProgramacion: string | null;

  @Column({ name: 'perfil_emo_id', type: 'uuid', nullable: true })
  perfilEmoId: string | null;

  @Column({ name: 'proyecto', type: 'varchar', length: 200, nullable: true })
  proyecto: string | null;

  @Column({ name: 'adicionales', type: 'text', nullable: true })
  adicionales: string | null;

  @Column({ name: 'recomendaciones_personalizadas', type: 'text', nullable: true })
  recomendacionesPersonalizadas: string | null;

  @Column({ name: 'fecha_programada', type: 'date' })
  fechaProgramada: Date;

  @Column({ name: 'fecha_realizado', type: 'date', nullable: true })
  fechaRealizado: Date | null;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento: Date | null;

  @Column({
    type: 'enum',
    enum: ResultadoExamen,
    default: ResultadoExamen.Pendiente,
  })
  resultado: ResultadoExamen;

  @Column({ type: 'text', nullable: true })
  restricciones: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  /** Diagnósticos CIE10 del EMO. JSON: [{code, description}] */
  @Column({ name: 'diagnosticos_cie10', type: 'jsonb', nullable: true })
  diagnosticosCie10: Array<{ code: string; description: string }> | null;

  @Column({ name: 'resultado_archivo_url', type: 'varchar', nullable: true })
  resultadoArchivoUrl: string | null;

  @Column({
    type: 'enum',
    enum: EstadoExamen,
    default: EstadoExamen.Programado,
  })
  estado: EstadoExamen;

  /** Se marca true cuando un Admin descarga el certificado de aptitud. */
  @Column({ name: 'visto_por_admin', default: false })
  vistoPorAdmin: boolean;

  @Column({ name: 'revisado_por_doctor', default: false })
  revisadoPorDoctor: boolean;

  @Column({ name: 'doctor_interno_id', type: 'uuid', nullable: true })
  doctorInternoId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'doctor_interno_id' })
  doctorInterno: Usuario | null;

  @Column({ name: 'fecha_revision_doctor', type: 'timestamptz', nullable: true })
  fechaRevisionDoctor: Date | null;

  @Column({ name: 'trabajador_area_snapshot', type: 'varchar', nullable: true })
  trabajadorAreaSnapshot: string | null;

  // Relaciones
  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'cargado_por_id', type: 'uuid' })
  cargadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cargado_por_id' })
  cargadoPor: Usuario;

  @OneToMany('ComentarioMedico', 'examen', {
    cascade: true,
  })
  comentarios: import('./comentario-medico.entity').ComentarioMedico[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
