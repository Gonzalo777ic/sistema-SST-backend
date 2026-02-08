import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum CategoriaDocumento {
  Politicas = 'Políticas',
  Reglamentos = 'Reglamentos',
  Procedimientos = 'Procedimientos',
  Manuales = 'Manuales',
  Matrices = 'Matrices',
  Planes = 'Planes',
  Estandares = 'Estándares',
}

@Entity('documentos_sst')
export class DocumentoSST {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  version: string;

  @Column({
    type: 'enum',
    enum: CategoriaDocumento,
  })
  categoria: CategoriaDocumento;

  @Column({ name: 'archivo_url' })
  archivoUrl: string;

  @Column()
  formato: string;

  @Column({ type: 'bigint', nullable: true })
  tamano: number | null;

  @Column({ name: 'fecha_publicacion', type: 'date' })
  fechaPublicacion: Date;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'descargas_count', type: 'int', default: 0 })
  descargasCount: number;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'subido_por_id', type: 'uuid' })
  subidoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subido_por_id' })
  subidoPor: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
