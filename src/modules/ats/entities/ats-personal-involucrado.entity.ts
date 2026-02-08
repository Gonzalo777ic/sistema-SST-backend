import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ATS } from './ats.entity';

@Entity('ats_personal_involucrado')
export class AtsPersonalInvolucrado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ats_id', type: 'uuid' })
  atsId: string;

  @ManyToOne(() => ATS, (ats) => ats.personalInvolucrado, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ats_id' })
  ats: ATS;

  @Column()
  nombre: string;

  @Column()
  documento: string;

  @Column({ type: 'text',name: 'firma_url', nullable: true })
  firmaUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
