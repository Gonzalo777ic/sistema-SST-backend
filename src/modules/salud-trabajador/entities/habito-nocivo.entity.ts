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
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

export enum TipoHabitoNocivo {
  Alcohol = 'Alcohol',
  Tabaco = 'Tabaco',
  Drogas = 'Drogas',
  Medicamentos = 'Medicamentos',
}

/**
 * Hábito nocivo del trabajador (Sección IV B).
 * Tipo, cantidad y frecuencia para cada hábito.
 * Datos confidenciales: solo visibles para Médico y Centro Médico.
 */
@Entity('habitos_nocivos')
export class HabitoNocivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: TipoHabitoNocivo,
  })
  tipo: TipoHabitoNocivo;

  @Column({ name: 'cantidad', type: 'varchar', length: 100, nullable: true })
  cantidad: string | null;

  @Column({ name: 'frecuencia', type: 'varchar', length: 100, nullable: true })
  frecuencia: string | null;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
