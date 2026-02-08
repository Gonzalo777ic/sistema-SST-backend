import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EvaluacionRiesgo } from './evaluacion-riesgo.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

export enum JerarquiaControl {
  Eliminacion = 'Eliminación',
  Sustitucion = 'Sustitución',
  ControlesIngenieria = 'Controles de Ingeniería',
  ControlesAdmin = 'Controles Administrativos',
  EPP = 'EPP',
}

export enum EstadoMedida {
  Pendiente = 'Pendiente',
  EnProceso = 'En Proceso',
  Implementado = 'Implementado',
}

@Entity('medidas_control')
export class MedidaControl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evaluacion_riesgo_id', type: 'uuid' })
  evaluacionRiesgoId: string;

  @ManyToOne(() => EvaluacionRiesgo, (evaluacion) => evaluacion.medidasControl, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluacion_riesgo_id' })
  evaluacionRiesgo: EvaluacionRiesgo;

  @Column({
    type: 'enum',
    enum: JerarquiaControl,
  })
  jerarquia: JerarquiaControl;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', nullable: true })
  responsable: string | null;

  @Column({ name: 'responsable_id', type: 'uuid', nullable: true })
  responsableId: string | null;

  @ManyToOne(() => Trabajador, { nullable: true })
  @JoinColumn({ name: 'responsable_id' })
  responsableTrabajador: Trabajador | null;

  @Column({ name: 'fecha_implementacion', type: 'date', nullable: true })
  fechaImplementacion: Date | null;

  @Column({
    name: 'estado_medida',
    type: 'enum',
    enum: EstadoMedida,
    default: EstadoMedida.Pendiente,
  })
  estadoMedida: EstadoMedida;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
