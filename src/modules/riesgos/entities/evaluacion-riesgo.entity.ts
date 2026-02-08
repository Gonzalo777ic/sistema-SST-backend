import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Area } from '../../empresas/entities/area.entity';
import { IPERC } from '../../iperc/entities/iperc.entity';
import { MedidaControl } from './medida-control.entity';

export enum TipoPeligro {
  Fisico = 'Físico',
  Quimico = 'Químico',
  Biologico = 'Biológico',
  Ergonómico = 'Ergonómico',
  Psicosocial = 'Psicosocial',
  Mecanico = 'Mecánico',
  Electrico = 'Eléctrico',
  Locativo = 'Locativo',
}

export enum Probabilidad {
  MuyBaja = 'Muy Baja',
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta',
  MuyAlta = 'Muy Alta',
}

export enum Consecuencia {
  Insignificante = 'Insignificante',
  Menor = 'Menor',
  Moderada = 'Moderada',
  Mayor = 'Mayor',
  Catastrofica = 'Catastrófica',
}

export enum NivelRiesgo {
  Trivial = 'Trivial',
  Tolerable = 'Tolerable',
  Moderado = 'Moderado',
  Importante = 'Importante',
  Intolerable = 'Intolerable',
}

export enum EstadoEvaluacionRiesgo {
  Pendiente = 'Pendiente',
  EnRevision = 'En Revisión',
  Aprobada = 'Aprobada',
  RequiereActualizacion = 'Requiere Actualización',
}

@Entity('evaluaciones_riesgo')
export class EvaluacionRiesgo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  actividad: string;

  @Column({ name: 'peligro_identificado', type: 'text' })
  peligroIdentificado: string;

  @Column({
    name: 'tipo_peligro',
    type: 'enum',
    enum: TipoPeligro,
  })
  tipoPeligro: TipoPeligro;

  @Column({ name: 'fecha_evaluacion', type: 'date' })
  fechaEvaluacion: Date;

  @Column({
    type: 'enum',
    enum: Probabilidad,
  })
  probabilidad: Probabilidad;

  @Column({
    type: 'enum',
    enum: Consecuencia,
  })
  consecuencia: Consecuencia;

  @Column({
    name: 'nivel_riesgo',
    type: 'enum',
    enum: NivelRiesgo,
  })
  nivelRiesgo: NivelRiesgo;

  @Column({ name: 'controles_actuales', type: 'text', nullable: true })
  controlesActuales: string | null;

  @Column({
    name: 'riesgo_residual',
    type: 'enum',
    enum: NivelRiesgo,
    nullable: true,
  })
  riesgoResidual: NivelRiesgo | null;

  @Column({
    type: 'enum',
    enum: EstadoEvaluacionRiesgo,
    default: EstadoEvaluacionRiesgo.Pendiente,
  })
  estado: EstadoEvaluacionRiesgo;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area | null;

  @Column({ name: 'evaluador_id', type: 'uuid' })
  evaluadorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'evaluador_id' })
  evaluador: Usuario;

  @Column({ name: 'iperc_padre_id', type: 'uuid', nullable: true })
  ipercPadreId: string | null;

  @ManyToOne(() => IPERC, { nullable: true })
  @JoinColumn({ name: 'iperc_padre_id' })
  ipercPadre: IPERC | null;

  @OneToMany(() => MedidaControl, (medida) => medida.evaluacionRiesgo, {
    cascade: true,
  })
  medidasControl: MedidaControl[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
