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
import { Capacitacion } from './capacitacion.entity';
import { ResultadoExamen } from './resultado-examen.entity';

@Entity('examenes_capacitacion')
export class ExamenCapacitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ name: 'duracion_minutos', type: 'int', default: 30 })
  duracionMinutos: number;

  @Column({ name: 'puntaje_minimo_aprobacion', type: 'int', default: 70 })
  puntajeMinimoAprobacion: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'preguntas', type: 'jsonb' })
  preguntas: Array<{
    texto_pregunta: string;
    tipo: 'OpcionMultiple' | 'VerdaderoFalso';
    opciones: string[];
    respuesta_correcta_index: number;
    puntaje: number;
  }>;

  // Relaciones
  @Column({ name: 'capacitacion_id', type: 'uuid' })
  capacitacionId: string;

  @ManyToOne(() => Capacitacion, (capacitacion) => capacitacion.examenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'capacitacion_id' })
  capacitacion: Capacitacion;

  @OneToMany(() => ResultadoExamen, (resultado) => resultado.examen, {
    cascade: true,
  })
  resultados: ResultadoExamen[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
