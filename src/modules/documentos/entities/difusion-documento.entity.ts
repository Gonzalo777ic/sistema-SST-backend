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
import { DocumentoSST } from './documento-sst.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DifusionFirma } from './difusion-firma.entity';

export enum EstadoDifusion {
  EnProceso = 'En proceso',
  Cerrada = 'Cerrada',
}

@Entity('difusiones_documentos')
export class DifusionDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'documento_id', type: 'uuid' })
  documentoId: string;

  @ManyToOne(() => DocumentoSST, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'documento_id' })
  documento: DocumentoSST;

  @Column({ name: 'fecha_difusion', type: 'date' })
  fechaDifusion: Date;

  @Column({ name: 'requiere_firma', default: true })
  requiereFirma: boolean;

  @Column({
    type: 'enum',
    enum: EstadoDifusion,
    default: EstadoDifusion.EnProceso,
  })
  estado: EstadoDifusion;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'responsable_id', type: 'uuid' })
  responsableId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Usuario;

  @OneToMany(() => DifusionFirma, (firma) => firma.difusion)
  firmas: DifusionFirma[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
