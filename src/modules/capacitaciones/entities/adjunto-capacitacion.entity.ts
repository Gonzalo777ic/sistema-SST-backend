import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Capacitacion } from './capacitacion.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('adjuntos_capacitacion')
export class AdjuntoCapacitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ name: 'archivo_url', type: 'text' })
  archivoUrl: string;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 255 })
  nombreArchivo: string;

  @Column({ name: 'capacitacion_id', type: 'uuid' })
  capacitacionId: string;

  @ManyToOne(() => Capacitacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'capacitacion_id' })
  capacitacion: Capacitacion;

  @Column({ name: 'registrado_por_id', type: 'uuid' })
  registradoPorId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'registrado_por_id' })
  registradoPor: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
