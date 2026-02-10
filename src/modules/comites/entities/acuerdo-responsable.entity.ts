import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AcuerdoComite } from './acuerdo-comite.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

@Entity('acuerdos_responsables')
export class AcuerdoResponsable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'acuerdo_id', type: 'uuid' })
  acuerdoId: string;

  @ManyToOne(() => AcuerdoComite, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'acuerdo_id' })
  acuerdo: AcuerdoComite;

  @Column({ name: 'responsable_id', type: 'uuid' })
  responsableId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Trabajador;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
