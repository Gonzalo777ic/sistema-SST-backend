import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Capacitacion } from './capacitacion.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

@Entity('resultados_evaluacion_paso')
export class ResultadoEvaluacionPaso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'capacitacion_id', type: 'uuid' })
  capacitacionId: string;

  @ManyToOne(() => Capacitacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'capacitacion_id' })
  capacitacion: Capacitacion;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'paso_id', type: 'varchar', length: 100 })
  pasoId: string;

  @Column({ name: 'intento_num', type: 'int', default: 1 })
  intentoNum: number;

  @Column({ name: 'puntaje_obtenido', type: 'decimal', precision: 5, scale: 2 })
  puntajeObtenido: number;

  @Column({ name: 'puntaje_total', type: 'decimal', precision: 5, scale: 2 })
  puntajeTotal: number;

  @Column({ default: false })
  aprobado: boolean;

  @Column({ name: 'respuestas', type: 'jsonb' })
  respuestas: Array<{
    pregunta_index: number;
    respuesta_seleccionada: number;
    es_correcta: boolean;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
