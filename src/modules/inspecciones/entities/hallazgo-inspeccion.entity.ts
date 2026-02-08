import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Inspeccion } from './inspeccion.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

export enum CriticidadHallazgo {
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta',
  Critica = 'Crítica',
}

export enum EstadoHallazgo {
  Pendiente = 'Pendiente',
  EnProceso = 'En Proceso',
  Corregido = 'Corregido/Cerrado',
}

@Entity('hallazgos_inspeccion')
export class HallazgoInspeccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inspeccion_id', type: 'uuid' })
  inspeccionId: string;

  @ManyToOne(() => Inspeccion, (inspeccion) => inspeccion.hallazgos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inspeccion_id' })
  inspeccion: Inspeccion;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: CriticidadHallazgo,
  })
  criticidad: CriticidadHallazgo;

  @Column({ name: 'foto_url', type: 'varchar', nullable: true })
  fotoUrl: string | null;

  @Column({ name: 'accion_correctiva', type: 'text' })
  accionCorrectiva: string;

  @Column({ name: 'responsable_id', type: 'uuid' })
  responsableId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Trabajador;

  @Column({ name: 'fecha_limite', type: 'date' })
  fechaLimite: Date;

  @Column({
    name: 'estado_hallazgo',
    type: 'enum',
    enum: EstadoHallazgo,
    default: EstadoHallazgo.Pendiente,
  })
  estadoHallazgo: EstadoHallazgo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
