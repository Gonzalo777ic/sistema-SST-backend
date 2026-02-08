import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExamenMedico } from './examen-medico.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('comentarios_medicos')
export class ComentarioMedico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comentario: string;

  @Column({ type: 'text', nullable: true })
  recomendaciones: string | null;

  @Column({ name: 'fecha_comentario', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaComentario: Date;

  @Column({ name: 'es_confidencial', default: true })
  esConfidencial: boolean;

  @Column({ name: 'leido_por_paciente', default: false })
  leidoPorPaciente: boolean;

  @Column({ name: 'fecha_lectura', type: 'timestamptz', nullable: true })
  fechaLectura: Date | null;

  // Relaciones
  @Column({ name: 'examen_id', type: 'uuid' })
  examenId: string;

  @ManyToOne(() => ExamenMedico, (examen) => examen.comentarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'examen_id' })
  examen: ExamenMedico;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'doctor_id', type: 'uuid' })
  doctorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Usuario;

  @Column({ name: 'doctor_nombre' })
  doctorNombre: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
