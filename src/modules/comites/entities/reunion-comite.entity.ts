import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Comite } from './comite.entity';
import { AcuerdoComite } from './acuerdo-comite.entity';
import { AgendaReunion } from './agenda-reunion.entity';

export enum EstadoReunion {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum TipoReunion {
  ORDINARIA = 'ORDINARIA',
  EXTRAORDINARIA = 'EXTRAORDINARIA',
}

@Entity('reuniones_comite')
export class ReunionComite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'comite_id', type: 'uuid' })
  comiteId: string;

  @ManyToOne(() => Comite, (comite) => comite.reuniones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comite_id' })
  comite: Comite;

  @Column({ type: 'varchar' })
  sesion: string; // Ej: "Sesión N° 001-2024"

  @Column({ name: 'fecha_realizacion', type: 'date' })
  fechaRealizacion: Date;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({
    type: 'enum',
    enum: EstadoReunion,
    default: EstadoReunion.PENDIENTE,
  })
  estado: EstadoReunion;

  @Column({
    name: 'tipo_reunion',
    type: 'enum',
    enum: TipoReunion,
    default: TipoReunion.ORDINARIA,
  })
  tipoReunion: TipoReunion;

  @Column({ type: 'varchar', nullable: true })
  lugar: string | null;

  @Column({ name: 'hora_registro', type: 'varchar', nullable: true })
  horaRegistro: string | null; // Formato HH:mm

  @Column({ name: 'enviar_alerta', type: 'boolean', default: false })
  enviarAlerta: boolean;

  @OneToMany(() => AcuerdoComite, (acuerdo) => acuerdo.reunion)
  acuerdos: AcuerdoComite[];

  @OneToMany(() => AgendaReunion, (agenda) => agenda.reunion)
  agenda: AgendaReunion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
