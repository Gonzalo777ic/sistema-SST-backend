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
import { ReunionComite } from './reunion-comite.entity';

@Entity('agenda_reunion')
export class AgendaReunion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reunion_id', type: 'uuid' })
  reunionId: string;

  @ManyToOne(() => ReunionComite, (reunion) => reunion.agenda, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reunion_id' })
  reunion: ReunionComite;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'int' })
  orden: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
