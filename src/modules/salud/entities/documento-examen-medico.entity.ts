import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExamenMedico } from './examen-medico.entity';

/**
 * Documentos adjuntos subidos por el Centro Médico para un examen.
 * Etiquetado flexible: cada archivo tiene un tipo (del Maestro de Tipos/Resultados).
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

  @Column({ name: 'tipo_etiqueta', type: 'varchar', length: 200 })
  tipoEtiqueta: string;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 500 })
  nombreArchivo: string;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
