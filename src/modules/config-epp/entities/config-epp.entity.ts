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

  /** Número WhatsApp del encargado de EPP (ej: 51999111222) */
  @Column({ name: 'whatsapp_numero', type: 'varchar', length: 20, nullable: true })
  whatsappNumero: string | null;

  /** Nombre del encargado de EPP para mensajes */
  @Column({ name: 'whatsapp_nombre', type: 'varchar', length: 100, nullable: true })
  whatsappNombre: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
