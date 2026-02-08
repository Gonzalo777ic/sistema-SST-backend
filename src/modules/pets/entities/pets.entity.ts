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
import { Area } from '../../empresas/entities/area.entity';
import { PetsPaso } from './pets-paso.entity';
import { PetsLectura } from './pets-lectura.entity';

export enum EstadoPETS {
  Borrador = 'Borrador',
  PendienteRevision = 'Pendiente de Revisión',
  EnRevision = 'En Revisión',
  Vigente = 'Vigente',
  Obsoleto = 'Obsoleto',
}

@Entity('pets')
@Index(['codigo', 'version'], { unique: true })
export class PETS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  codigo: string;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: EstadoPETS,
    default: EstadoPETS.Borrador,
  })
  estado: EstadoPETS;

  @Column({ type: 'text' })
  objetivo: string;

  @Column({ type: 'text' })
  alcance: string;

  @Column({ type: 'text', nullable: true })
  definiciones: string | null;

  @Column({ name: 'area_proceso', type: 'varchar', nullable: true })
  areaProceso: string | null;

  @Column({ name: 'referencias_normativas', type: 'simple-array', nullable: true })
  referenciasNormativas: string[] | null;

  @Column({ name: 'equipos_materiales', type: 'jsonb', nullable: true })
  equiposMateriales: Array<{
    nombre: string;
    tipo: string;
    obligatorio: boolean;
  }> | null;

  @Column({ name: 'requisitos_previos', type: 'jsonb', nullable: true })
  requisitosPrevios: {
    competencias?: string[];
    herramientas?: string[];
    permisos_asociados?: string[];
  } | null;

  @Column({ name: 'fecha_emision', type: 'date' })
  fechaEmision: Date;

  @Column({ name: 'fecha_revision', type: 'date', nullable: true })
  fechaRevision: Date | null;

  // Firmas
  @Column({ name: 'elaborador_id', type: 'uuid' })
  elaboradorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'elaborador_id' })
  elaborador: Usuario;

  @Column({ name: 'fecha_firma_elaborador', type: 'timestamptz', nullable: true })
  fechaFirmaElaborador: Date | null;

  @Column({ name: 'revisor_id', type: 'uuid', nullable: true })
  revisorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'revisor_id' })
  revisor: Usuario | null;

  @Column({ name: 'fecha_firma_revisor', type: 'timestamptz', nullable: true })
  fechaFirmaRevisor: Date | null;

  @Column({ name: 'aprobador_id', type: 'uuid', nullable: true })
  aprobadorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'aprobador_id' })
  aprobador: Usuario | null;

  @Column({ name: 'fecha_firma_aprobador', type: 'timestamptz', nullable: true })
  fechaFirmaAprobador: Date | null;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @OneToMany(() => PetsPaso, (paso) => paso.pets, {
    cascade: true,
  })
  pasos: PetsPaso[];

  @OneToMany(() => PetsLectura, (lectura) => lectura.pets, {
    cascade: true,
  })
  lecturas: PetsLectura[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
