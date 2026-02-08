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
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

export enum DiaSemana {
  Lunes = 'Lunes',
  Martes = 'Martes',
  Miercoles = 'Miércoles',
  Jueves = 'Jueves',
  Viernes = 'Viernes',
  Sabado = 'Sábado',
  Domingo = 'Domingo',
}

@Entity('horarios_doctor')
@Index(['doctorId', 'diaSemana', 'horaInicio', 'horaFin'], { unique: true })
export class HorarioDoctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'dia_semana',
    type: 'enum',
    enum: DiaSemana,
  })
  diaSemana: DiaSemana;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin: string;

  @Column({ name: 'duracion_cita_minutos', type: 'int', default: 30 })
  duracionCitaMinutos: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // Relaciones
  @Column({ name: 'doctor_id', type: 'uuid' })
  doctorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Usuario;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
