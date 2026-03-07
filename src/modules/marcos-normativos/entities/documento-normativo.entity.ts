import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MarcoNormativo } from './marco-normativo.entity';

@Entity('documentos_normativos')
export class DocumentoNormativo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'marco_normativo_id', type: 'uuid' })
  marcoNormativoId: string;

  @ManyToOne(() => MarcoNormativo, (marco) => marco.documentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'marco_normativo_id' })
  marcoNormativo: MarcoNormativo;

  @Column({ type: 'varchar', length: 300 })
  nombre: string;

  @Column({ name: 'archivo_url', type: 'varchar', length: 500 })
  archivoUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
