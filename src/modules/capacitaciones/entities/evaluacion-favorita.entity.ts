import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('evaluaciones_favoritas')
export class EvaluacionFavorita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ name: 'preguntas', type: 'jsonb' })
  preguntas: Array<{
    texto_pregunta: string;
    tipo: 'OpcionMultiple' | 'VerdaderoFalso';
    opciones: string[];
    respuesta_correcta_index: number;
    puntaje: number;
  }>;

  @Column({ name: 'empresa_id', type: 'uuid', nullable: true })
  empresaId: string | null;

  @ManyToOne(() => Empresa, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa | null;

  @Column({ name: 'creado_por_id', type: 'uuid' })
  creadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creado_por_id' })
  creadoPor: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
