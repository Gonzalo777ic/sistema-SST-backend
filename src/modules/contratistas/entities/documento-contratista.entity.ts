import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contratista } from './contratista.entity';

export enum TipoDocumentoContratista {
  RUC = 'RUC',
  SCTR = 'SCTR',
  Poliza = 'Póliza',
  ISO = 'ISO',
  PlanSST = 'Plan SST',
  Otro = 'Otro',
}

export enum EstadoDocumento {
  Vigente = 'Vigente',
  PorVencer = 'Por Vencer',
  Vencido = 'Vencido',
  Pendiente = 'Pendiente',
}

@Entity('documentos_contratista')
export class DocumentoContratista {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contratista_id', type: 'uuid' })
  contratistaId: string;

  @ManyToOne(() => Contratista, (contratista) => contratista.documentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contratista_id' })
  contratista: Contratista;

  @Column({
    name: 'tipo_documento',
    type: 'enum',
    enum: TipoDocumentoContratista,
  })
  tipoDocumento: TipoDocumentoContratista;

  @Column({ name: 'archivo_url', type: 'varchar' })
  archivoUrl: string;

  @Column({ name: 'fecha_emision', type: 'date' })
  fechaEmision: Date;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: Date;

  @Column({
    name: 'estado_doc',
    type: 'enum',
    enum: EstadoDocumento,
    default: EstadoDocumento.Pendiente,
  })
  estadoDoc: EstadoDocumento;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
