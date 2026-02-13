import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { EPP } from './epp.entity';

@Entity('trabajador_epp_favoritos')
@Unique(['trabajadorId', 'eppId'])
export class TrabajadorEppFavorito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'epp_id', type: 'uuid' })
  eppId: string;

  @ManyToOne(() => EPP, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'epp_id' })
  epp: EPP;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
