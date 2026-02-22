import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ExamenMedico } from './examen-medico.entity';

export enum TipoSeguimiento {
  INTERCONSULTA = 'INTERCONSULTA',
  VIGILANCIA = 'VIGILANCIA',
}

export enum EspecialidadSeguimiento {
  CARDIOLOGIA = 'CARDIOLOGÍA',
  OFTALMOLOGIA = 'OFTALMOLOGÍA',
  NEUMOLOGIA = 'NEUMOLOGÍA',
  TRAUMATOLOGIA = 'TRAUMATOLOGÍA',
  DERMATOLOGIA = 'DERMATOLOGÍA',
  GASTROENTEROLOGIA = 'GASTROENTEROLOGÍA',
  NEFROLOGIA = 'NEFROLOGÍA',
  ENDOCRINOLOGIA = 'ENDOCRINOLOGÍA',
  NEUROLOGIA = 'NEUROLOGÍA',
  PSIQUIATRIA = 'PSIQUIATRÍA',
  PSICOLOGIA = 'PSICOLOGÍA',
  NUTRICION = 'NUTRICIÓN',
  OTORRINOLARINGOLOGIA = 'OTORRINOLARINGOLOGÍA',
  OTROS = 'OTROS',
}

export enum EstadoSeguimiento {
  PENDIENTE = 'PENDIENTE',
  CUMPLE = 'CUMPLE',
  NO_CUMPLE = 'NO_CUMPLE',
}

@Entity('seguimientos_medicos')
export class SeguimientoMedico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoSeguimiento })
  tipo: TipoSeguimiento;

  @Column({ name: 'examen_medico_id', type: 'uuid' })
  examenMedicoId: string;

  @ManyToOne(() => ExamenMedico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examen_medico_id' })
  examenMedico: ExamenMedico;

  @Column({ name: 'cie10_code', type: 'varchar', length: 20 })
  cie10Code: string;

  @Column({ name: 'cie10_description', type: 'text', nullable: true })
  cie10Description: string | null;

  @Column({ type: 'enum', enum: EspecialidadSeguimiento })
  especialidad: EspecialidadSeguimiento;

  @Column({ type: 'enum', enum: EstadoSeguimiento, default: EstadoSeguimiento.PENDIENTE })
  estado: EstadoSeguimiento;

  @Column({ type: 'date' })
  plazo: Date;

  @Column({ type: 'text', nullable: true })
  motivo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
