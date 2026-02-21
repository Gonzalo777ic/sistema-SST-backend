import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExamenMedico } from './examen-medico.entity';
import { PruebaMedica } from './prueba-medica.entity';

/**
 * Documentos adjuntos subidos por el Centro Médico para un examen.
 * Cada archivo está etiquetado por una PruebaMedica (hemograma, optometría, etc.).
 */
@Entity('documentos_examen_medico')
export class DocumentoExamenMedico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'examen_id', type: 'uuid' })
  examenId: string;

  @ManyToOne(() => ExamenMedico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examen_id' })
  examen: ExamenMedico;

  @Column({ name: 'prueba_medica_id', type: 'uuid', nullable: true })
  pruebaMedicaId: string | null;

  @ManyToOne(() => PruebaMedica, { nullable: true })
  @JoinColumn({ name: 'prueba_medica_id' })
  pruebaMedica: PruebaMedica | null;

  /** Fallback para documentos migrados o "Otros" */
  @Column({ name: 'tipo_etiqueta', type: 'varchar', length: 200, nullable: true })
  tipoEtiqueta: string | null;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 500 })
  nombreArchivo: string;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
