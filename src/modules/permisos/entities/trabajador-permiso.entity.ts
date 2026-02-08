import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PermisoTrabajo } from './permiso-trabajo.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

@Entity('trabajadores_permiso')
@Index(['permisoId', 'trabajadorId'], { unique: true })
export class TrabajadorPermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'permiso_id', type: 'uuid' })
  permisoId: string;

  @ManyToOne(() => PermisoTrabajo, (permiso) => permiso.trabajadores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permiso_id' })
  permiso: PermisoTrabajo;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  // Snapshots
  @Column({ name: 'nombre_trabajador', type: 'varchar' })
  nombreTrabajador: string;

  @Column({ name: 'documento_trabajador', type: 'varchar' })
  documentoTrabajador: string;

  @Column({ type: 'varchar', nullable: true })
  rol: string | null;

  @Column({ name: 'confirmado_lectura', default: false })
  confirmadoLectura: boolean;

  @Column({ name: 'fecha_confirmacion', type: 'timestamptz', nullable: true })
  fechaConfirmacion: Date | null;

  @Column({ name: 'firma_url', type: 'varchar', nullable: true })
  firmaUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
