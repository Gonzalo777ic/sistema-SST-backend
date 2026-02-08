import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IPERC, EstadoIPERC } from './iperc.entity';

export enum NivelRiesgo {
  Trivial = 'Trivial',
  Tolerable = 'Tolerable',
  Moderado = 'Moderado',
  Importante = 'Importante',
  Intolerable = 'Intolerable',
}

@Entity('lineas_iperc')
export class LineaIPERC {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'iperc_id', type: 'uuid' })
  ipercId: string;

  @ManyToOne(() => IPERC, (iperc) => iperc.lineasIperc, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iperc_id' })
  iperc: IPERC;

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'text' })
  actividad: string;

  @Column({ type: 'text' })
  tarea: string;

  @Column({ name: 'puesto_trabajo', type: 'varchar', nullable: true })
  puestoTrabajo: string | null;

  @Column({ type: 'text' })
  peligro: string;

  @Column({ type: 'text' })
  riesgo: string;

  @Column({ name: 'requisito_legal', type: 'text', nullable: true })
  requisitoLegal: string | null;

  // Probabilidad
  @Column({ name: 'probabilidad_a', type: 'int' })
  probabilidadA: number;

  @Column({ name: 'probabilidad_b', type: 'int' })
  probabilidadB: number;

  @Column({ name: 'probabilidad_c', type: 'int' })
  probabilidadC: number;

  @Column({ name: 'probabilidad_d', type: 'int' })
  probabilidadD: number;

  @Column({ name: 'indice_probabilidad', type: 'int' })
  indiceProbabilidad: number;

  // Severidad y Riesgo
  @Column({ name: 'indice_severidad', type: 'int' })
  indiceSeveridad: number;

  @Column({ name: 'valor_riesgo', type: 'int' })
  valorRiesgo: number;

  @Column({
    name: 'nivel_riesgo',
    type: 'enum',
    enum: NivelRiesgo,
  })
  nivelRiesgo: NivelRiesgo;

  // Jerarquía de controles
  @Column({ name: 'jerarquia_eliminacion', default: false })
  jerarquiaEliminacion: boolean;

  @Column({ name: 'jerarquia_sustitucion', default: false })
  jerarquiaSustitucion: boolean;

  @Column({ name: 'jerarquia_controles_ingenieria', default: false })
  jerarquiaControlesIngenieria: boolean;

  @Column({ name: 'jerarquia_controles_admin', default: false })
  jerarquiaControlesAdmin: boolean;

  @Column({ name: 'jerarquia_epp', default: false })
  jerarquiaEpp: boolean;

  @Column({ name: 'medidas_control', type: 'text' })
  medidasControl: string;

  @Column({ type: 'text', nullable: true })
  responsable: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
