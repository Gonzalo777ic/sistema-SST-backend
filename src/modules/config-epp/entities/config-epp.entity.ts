import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('config_epp')
export class ConfigEPP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Umbral de vigencia en meses (X). Si vigencia >= este valor y costo >= umbral_costo -> Core */
  @Column({ name: 'umbral_vigencia_meses', type: 'int', default: 6 })
  umbralVigenciaMeses: number;

  /** Umbral de costo en soles (Y). Si vigencia >= umbral y costo >= este valor -> Core */
  @Column({ name: 'umbral_costo', type: 'decimal', precision: 10, scale: 2, default: 50 })
  umbralCosto: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
