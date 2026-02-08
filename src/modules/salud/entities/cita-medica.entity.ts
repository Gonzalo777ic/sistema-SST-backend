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
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ExamenMedico } from './examen-medico.entity';

export enum EstadoCita {
  Programada = 'Programada',
  Confirmada = 'Confirmada',
  Completada = 'Completada',
  Cancelada = 'Cancelada',
  NoAsistio = 'No Asistió',
}

@Entity('citas_medicas')
@Index(['doctorId', 'fechaCita', 'horaCita'], { unique: true })
export class CitaMedica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  motivo: string;

  @Column({
    type: 'enum',
    enum: EstadoCita,
    default: EstadoCita.Programada,
  })
  estado: EstadoCita;

  @Column({ name: 'fecha_cita', type: 'date' })
  fechaCita: Date;

  @Column({ name: 'hora_cita', type: 'time' })
  horaCita: string;

  @Column({ name: 'duracion_minutos', type: 'int', default: 30 })
  duracionMinutos: number;

  @Column({ name: 'fecha_confirmacion', type: 'timestamptz', nullable: true })
  fechaConfirmacion: Date | null;

  @Column({ name: 'notas_cita', type: 'text', nullable: true })
  notasCita: string | null;

  @Column({ name: 'doctor_nombre', type: 'varchar', nullable: true })
  doctorNombre: string | null;

  // Relaciones
  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Usuario | null;

  @Column({ name: 'examen_relacionado_id', type: 'uuid', nullable: true })
  examenRelacionadoId: string | null;

  @ManyToOne(() => ExamenMedico, { nullable: true })
  @JoinColumn({ name: 'examen_relacionado_id' })
  examenRelacionado: ExamenMedico | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
