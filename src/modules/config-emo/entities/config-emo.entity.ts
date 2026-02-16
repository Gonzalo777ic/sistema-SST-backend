import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('config_emo')
export class ConfigEmo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recomendaciones_colaborador', type: 'text', nullable: true })
  recomendacionesColaborador: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
