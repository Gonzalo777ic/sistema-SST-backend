import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Comite } from './comite.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

export enum TipoMiembro {
  TITULAR = 'TITULAR',
  SUPLENTE = 'SUPLENTE',
}

export enum RolComite {
  PRESIDENTE = 'PRESIDENTE',
  SECRETARIO = 'SECRETARIO',
  MIEMBRO = 'MIEMBRO',
  OBSERVADOR = 'OBSERVADOR',
}

export enum Representacion {
  EMPLEADOR = 'EMPLEADOR',
  TRABAJADOR = 'TRABAJADOR',
}

@Entity('miembros_comite')
export class MiembroComite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'comite_id', type: 'uuid' })
  comiteId: string;

  @ManyToOne(() => Comite, (comite) => comite.miembros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comite_id' })
  comite: Comite;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({
    name: 'tipo_miembro',
    type: 'enum',
    enum: TipoMiembro,
  })
  tipoMiembro: TipoMiembro;

  @Column({
    name: 'rol_comite',
    type: 'enum',
    enum: RolComite,
  })
  rolComite: RolComite;

  @Column({
    type: 'enum',
    enum: Representacion,
  })
  representacion: Representacion;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
