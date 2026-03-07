import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { DocumentoNormativo } from './documento-normativo.entity';
@Entity('marcos_normativos')
export class MarcoNormativo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Empresa propietaria (creadora). Null para marcos del sistema/predeterminados. */
  @Column({ name: 'empresa_id', type: 'uuid', nullable: true })
  empresaPropietariaId: string | null;

  @ManyToOne(() => Empresa, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'empresa_id' })
  empresaPropietaria: Empresa | null;

  @Column({ type: 'varchar', length: 300 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => DocumentoNormativo, (doc) => doc.marcoNormativo)
  documentos: DocumentoNormativo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
