import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Capacitacion } from './capacitacion.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

@Entity('asistencias_capacitacion')
export class AsistenciaCapacitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'capacitacion_id', type: 'uuid' })
  capacitacionId: string;

  @ManyToOne(() => Capacitacion, (capacitacion) => capacitacion.asistencias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'capacitacion_id' })
  capacitacion: Capacitacion;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'nombre_snapshot' })
  nombreSnapshot: string;

  @Column({ default: false })
  asistencia: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  calificacion: number | null;

  @Column({ default: false })
  aprobado: boolean;

  @Column({ name: 'firmo', type: 'boolean', default: false })
  firmo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
