import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

/**
 * Antecedentes patológicos personales del trabajador (Sección IV A).
 * Datos confidenciales: solo visibles para Médico y Centro Médico.
 * Persistencia longitudinal para futuras citas EMO.
 */
@Entity('salud_trabajador')
export class SaludTrabajador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'trabajador_id', type: 'uuid', unique: true })
  trabajadorId: string;

  @OneToOne(() => Trabajador, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  // Booleanos - enfermedades comunes
  @Column({ name: 'alergias', type: 'boolean', default: false })
  alergias: boolean;

  @Column({ name: 'diabetes', type: 'boolean', default: false })
  diabetes: boolean;

  @Column({ name: 'tbc', type: 'boolean', default: false })
  tbc: boolean;

  @Column({ name: 'hepatitis_b', type: 'boolean', default: false })
  hepatitisB: boolean;

  @Column({ name: 'asma', type: 'boolean', default: false })
  asma: boolean;

  @Column({ name: 'hta', type: 'boolean', default: false })
  hta: boolean;

  @Column({ name: 'its', type: 'boolean', default: false })
  its: boolean;

  @Column({ name: 'tifoidea', type: 'boolean', default: false })
  tifoidea: boolean;

  @Column({ name: 'bronquitis', type: 'boolean', default: false })
  bronquitis: boolean;

  @Column({ name: 'neoplasia', type: 'boolean', default: false })
  neoplasia: boolean;

  @Column({ name: 'convulsiones', type: 'boolean', default: false })
  convulsiones: boolean;

  @Column({ name: 'quemaduras', type: 'boolean', default: false })
  quemaduras: boolean;

  @Column({ name: 'cirugias', type: 'boolean', default: false })
  cirugias: boolean;

  @Column({ name: 'intoxicaciones', type: 'boolean', default: false })
  intoxicaciones: boolean;

  @Column({ name: 'otros', type: 'boolean', default: false })
  otros: boolean;

  // Detalles cuando se marca el checkbox
  @Column({ name: 'detalle_cirugias', type: 'text', nullable: true })
  detalleCirugias: string | null;

  @Column({ name: 'detalle_otros', type: 'text', nullable: true })
  detalleOtros: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
