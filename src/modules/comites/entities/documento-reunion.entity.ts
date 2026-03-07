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

@Entity('documentos_reunion')
export class DocumentoReunion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reunion_id', type: 'uuid' })
  reunionId: string;

  @ManyToOne(() => ReunionComite, (reunion) => reunion.documentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reunion_id' })
  reunion: ReunionComite;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro: Date;

  @Column({ name: 'registrado_por_id', type: 'uuid', nullable: true })
  registradoPorId: string | null;

  @Column({ name: 'registrado_por_nombre', type: 'varchar', length: 300, nullable: true })
  registradoPorNombre: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
