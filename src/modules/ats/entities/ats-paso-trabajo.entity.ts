import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ATS } from './ats.entity';

@Entity('ats_pasos_trabajo')
export class AtsPasoTrabajo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ats_id', type: 'uuid' })
  atsId: string;

  @ManyToOne(() => ATS, (ats) => ats.pasosTrabajo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ats_id' })
  ats: ATS;

  @Column({ type: 'int' })
  numero: number;

  @Column({ name: 'paso_tarea', type: 'text' })
  pasoTarea: string;

  @Column({ name: 'peligros_riesgos', type: 'text' })
  peligrosRiesgos: string;

  @Column({ name: 'medidas_control', type: 'text' })
  medidasControl: string;

  @Column({ type: 'text', nullable: true })
  responsable: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
