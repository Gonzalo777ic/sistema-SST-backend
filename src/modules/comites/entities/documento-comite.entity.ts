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
import { Comite } from './comite.entity';

@Entity('documentos_comite')
export class DocumentoComite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'comite_id', type: 'uuid' })
  comiteId: string;

  @ManyToOne(() => Comite, (comite) => comite.documentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comite_id' })
  comite: Comite;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ name: 'fecha_registro', type: 'date', default: () => 'CURRENT_DATE' })
  fechaRegistro: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
