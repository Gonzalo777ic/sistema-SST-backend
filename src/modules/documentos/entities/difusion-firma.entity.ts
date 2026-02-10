import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { DifusionDocumento } from './difusion-documento.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';

@Entity('difusiones_firmas')
export class DifusionFirma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'difusion_id', type: 'uuid' })
  difusionId: string;

  @ManyToOne(() => DifusionDocumento, (difusion) => difusion.firmas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'difusion_id' })
  difusion: DifusionDocumento;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'firma_url', type: 'text', nullable: true })
  firmaUrl: string | null;

  @Column({ name: 'fecha_firma', type: 'timestamp', nullable: true })
  fechaFirma: Date | null;

  @Column({ name: 'fecha_lectura', type: 'timestamp', nullable: true })
  fechaLectura: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
