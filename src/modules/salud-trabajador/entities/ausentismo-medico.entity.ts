import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

/**
 * Ausentismo médico del trabajador (Sección V B).
 * Enfermedades/accidentes con días de descanso.
 * Permite estadísticas de siniestralidad.
 */
@Entity('ausentismos_medicos')
export class AusentismoMedico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enfermedad_accidente', type: 'text' })
  enfermedadAccidente: string;

  @Column({ name: 'asociado_trabajo', type: 'boolean' })
  asociadoTrabajo: boolean;

  @Column({ name: 'anio', type: 'int' })
  anio: number;

  @Column({ name: 'dias_descanso', type: 'int' })
  diasDescanso: number;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
