import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { CentroMedico } from '../../config-emo/entities/centro-medico.entity';

export enum EstadoParticipacion {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  REVOCADO = 'revocado',
}

/**
 * Representa la participación operativa de un usuario en un centro médico.
 * Permite: habilitar/revocar acceso sin eliminar cuenta, almacenar datos
 * de participación y mantener trazabilidad histórica.
 */
@Entity('usuario_centro_medico')
export class UsuarioCentroMedico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @Column({ name: 'centro_medico_id', type: 'uuid' })
  centroMedicoId: string;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoParticipacion,
    default: EstadoParticipacion.ACTIVO,
  })
  estado: EstadoParticipacion;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date | null;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => CentroMedico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'centro_medico_id' })
  centroMedico: CentroMedico;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
