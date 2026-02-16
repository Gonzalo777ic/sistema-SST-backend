import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('perfil_emo')
export class PerfilEmo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre', type: 'varchar', length: 300 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'costo_unitario', type: 'decimal', precision: 12, scale: 2, default: 0 })
  costoUnitario: number;

  @Column({ name: 'registrado_por_id', type: 'uuid' })
  registradoPorId: string;

  @Column({ name: 'registrado_por_nombre', type: 'varchar', length: 300 })
  registradoPorNombre: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
