import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DocumentoContratista } from './documento-contratista.entity';

export enum EstadoContratista {
  EnEvaluacion = 'En Evaluación',
  Activo = 'Activo',
  Suspendido = 'Suspendido',
  Inactivo = 'Inactivo',
}

@Entity('contratistas')
export class Contratista {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 11 })
  ruc: string;

  @Column({ name: 'razon_social', type: 'varchar' })
  razonSocial: string;

  @Column({ name: 'tipo_servicio', type: 'varchar' })
  tipoServicio: string;

  @Column({ name: 'representante_legal', type: 'varchar' })
  representanteLegal: string;

  @Column({ name: 'contacto_principal', type: 'varchar' })
  contactoPrincipal: string;

  @Column({ type: 'varchar' })
  telefono: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({
    type: 'enum',
    enum: EstadoContratista,
    default: EstadoContratista.EnEvaluacion,
  })
  estado: EstadoContratista;

  @Column({ name: 'evaluacion_desempeno', type: 'decimal', precision: 5, scale: 2, nullable: true })
  evaluacionDesempeno: number | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'supervisor_asignado_id', type: 'uuid', nullable: true })
  supervisorAsignadoId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisor_asignado_id' })
  supervisorAsignado: Usuario | null;

  @OneToMany(() => DocumentoContratista, (documento) => documento.contratista, {
    cascade: true,
  })
  documentos: DocumentoContratista[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
