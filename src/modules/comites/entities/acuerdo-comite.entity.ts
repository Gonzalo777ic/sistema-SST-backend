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
import { ReunionComite } from './reunion-comite.entity';
import { AcuerdoResponsable } from './acuerdo-responsable.entity';

export enum TipoAcuerdo {
  INFORMATIVO = 'INFORMATIVO',
  CON_SEGUIMIENTO = 'CON_SEGUIMIENTO',
}

export enum EstadoAcuerdo {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  APROBADO = 'APROBADO',
  ANULADO = 'ANULADO',
}

@Entity('acuerdos_comite')
export class AcuerdoComite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reunion_id', type: 'uuid' })
  reunionId: string;

  @ManyToOne(() => ReunionComite, (reunion) => reunion.acuerdos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reunion_id' })
  reunion: ReunionComite;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({
    type: 'enum',
    enum: TipoAcuerdo,
    default: TipoAcuerdo.CON_SEGUIMIENTO,
  })
  tipoAcuerdo: TipoAcuerdo;

  @Column({ name: 'fecha_programada', type: 'date', nullable: true })
  fechaProgramada: Date | null;

  @Column({ name: 'fecha_real', type: 'date', nullable: true })
  fechaReal: Date | null;

  @Column({
    type: 'enum',
    enum: EstadoAcuerdo,
    default: EstadoAcuerdo.PENDIENTE,
  })
  estado: EstadoAcuerdo;

  @OneToMany(() => AcuerdoResponsable, (ar) => ar.acuerdo)
  responsables: AcuerdoResponsable[];

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
