import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PETAR } from './petar.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

@Entity('petar_trabajadores')
export class PetarTrabajador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'petar_id', type: 'uuid' })
  petarId: string;

  @ManyToOne(() => PETAR, (petar) => petar.trabajadores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'petar_id' })
  petar: PETAR;

  @Column({ name: 'trabajador_id', type: 'uuid', nullable: true })
  trabajadorId: string | null;

  @ManyToOne(() => Trabajador, { nullable: true })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador | null;

  // Snapshot para auditoría histórica
  @Column({ name: 'nombre_snapshot' })
  nombreSnapshot: string;

  @Column({ name: 'documento_snapshot' })
  documentoSnapshot: string;

  @Column({ type: 'varchar', name: 'email_snapshot', nullable: true })
  emailSnapshot: string | null;

  @Column({ type: 'text', name: 'firma_url', nullable: true })
  firmaUrl: string | null;

  @Column({ name: 'fecha_firma', type: 'timestamptz', nullable: true })
  fechaFirma: Date | null;

  @Column({ default: false })
  confirmado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
