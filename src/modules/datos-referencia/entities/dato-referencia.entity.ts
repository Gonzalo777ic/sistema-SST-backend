import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum TipoDatoReferencia {
  CENTRO_COSTOS = 'CENTRO_COSTOS',
  NIVEL_EXPOSICION = 'NIVEL_EXPOSICION',
  TIPO_USUARIO = 'TIPO_USUARIO',
  MODALIDAD_CONTRATO = 'MODALIDAD_CONTRATO',
}

@Entity('datos_referencia')
export class DatoReferencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TipoDatoReferencia,
  })
  tipo: TipoDatoReferencia;

  @Column({ type: 'varchar', length: 150 })
  valor: string;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
