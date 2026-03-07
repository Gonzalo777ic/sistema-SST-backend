import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { MarcoNormativo } from './marco-normativo.entity';

/**
 * Tabla pivote: relaciona empresas con marcos normativos que pueden usar.
 * Una empresa puede tener N marcos; un marco puede estar vinculado a N empresas.
 * Permite reutilizar marcos entre empresas sin duplicar documentos.
 */
@Entity('empresa_marco_normativo')
@Unique(['empresaId', 'marcoNormativoId'])
export class EmpresaMarcoNormativo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'marco_normativo_id', type: 'uuid' })
  marcoNormativoId: string;

  @ManyToOne(() => MarcoNormativo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'marco_normativo_id' })
  marcoNormativo: MarcoNormativo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
