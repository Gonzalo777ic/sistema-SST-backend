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
import { MiembroComite } from './miembro-comite.entity';
import { DocumentoComite } from './documento-comite.entity';
import { ReunionComite } from './reunion-comite.entity';

@Entity('comites')
export class Comite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'nro_miembros', type: 'int', default: 0 })
  nroMiembros: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ name: 'registrado_por_id', type: 'uuid', nullable: true })
  registradoPorId: string | null;

  @Column({ name: 'registrado_por_nombre', type: 'varchar', length: 300, nullable: true })
  registradoPorNombre: string | null;

  @OneToMany(() => MiembroComite, (miembro) => miembro.comite)
  miembros: MiembroComite[];

  @OneToMany(() => DocumentoComite, (documento) => documento.comite)
  documentos: DocumentoComite[];

  @OneToMany(() => ReunionComite, (reunion) => reunion.comite)
  reuniones: ReunionComite[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
