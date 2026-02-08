import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExamenCapacitacion } from './examen-capacitacion.entity';
import { Capacitacion } from './capacitacion.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { CertificadoCapacitacion } from './certificado-capacitacion.entity';

@Entity('resultados_examen')
export class ResultadoExamen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fecha_examen', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaExamen: Date;

  @Column({ name: 'puntaje_obtenido', type: 'decimal', precision: 5, scale: 2 })
  puntajeObtenido: number;

  @Column({ default: false })
  aprobado: boolean;

  @Column({ name: 'respuestas', type: 'jsonb' })
  respuestas: Array<{
    pregunta_index: number;
    respuesta_seleccionada: number;
    es_correcta: boolean;
  }>;

  // Snapshots
  @Column({ name: 'trabajador_nombre', type: 'varchar' })
  trabajadorNombre: string;

  @Column({ name: 'trabajador_documento', type: 'varchar' })
  trabajadorDocumento: string;

  @Column({ name: 'trabajador_email', type: 'varchar', nullable: true })
  trabajadorEmail: string | null;

  // Relaciones
  @Column({ name: 'examen_id', type: 'uuid' })
  examenId: string;

  @ManyToOne(() => ExamenCapacitacion, (examen) => examen.resultados, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'examen_id' })
  examen: ExamenCapacitacion;

  @Column({ name: 'capacitacion_id', type: 'uuid' })
  capacitacionId: string;

  @ManyToOne(() => Capacitacion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'capacitacion_id' })
  capacitacion: Capacitacion;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @OneToOne(() => CertificadoCapacitacion, (certificado) => certificado.resultadoExamen, {
    nullable: true,
  })
  certificado: CertificadoCapacitacion | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
