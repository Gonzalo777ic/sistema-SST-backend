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
 * Antecedente ocupacional del trabajador.
 * Persistente en el perfil del trabajador para anamnesis laboral longitudinal.
 * Se precarga en futuras citas EMO (ej. cada 2 años).
 */
@Entity('antecedentes_ocupacionales')
export class AntecedenteOcupacional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa', type: 'varchar', length: 300 })
  empresa: string;

  @Column({ name: 'area_trabajo', type: 'varchar', length: 200, nullable: true })
  areaTrabajo: string | null;

  @Column({ name: 'ocupacion', type: 'varchar', length: 200 })
  ocupacion: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date | null;

  /** Tiempo total calculado (ej. "2 años 3 meses"). Se puede recalcular desde fechas. */
  @Column({ name: 'tiempo_total', type: 'varchar', length: 50, nullable: true })
  tiempoTotal: string | null;

  /** Exposición ocupacional: Ruido, Polvo, Químicos, Ergonomía, etc. */
  @Column({ name: 'riesgos', type: 'text', nullable: true })
  riesgos: string | null;

  /** EPP utilizado en ese periodo */
  @Column({ name: 'epp_utilizado', type: 'text', nullable: true })
  eppUtilizado: string | null;

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
