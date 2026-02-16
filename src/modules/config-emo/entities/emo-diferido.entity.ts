import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('emo_diferido')
export class EmoDiferido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre_apellido', type: 'varchar', length: 300 })
  nombreApellido: string;

  @Column({ name: 'tipo_documento', type: 'varchar', length: 50 })
  tipoDocumento: string;

  @Column({ name: 'numero_documento', type: 'varchar', length: 50 })
  numeroDocumento: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
