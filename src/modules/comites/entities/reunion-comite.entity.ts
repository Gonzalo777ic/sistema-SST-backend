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
import { DocumentoReunion } from './documento-reunion.entity';

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

  @Column({ name: 'numero_reunion', type: 'varchar', nullable: true })
  numeroReunion: string | null;

  @Column({ name: 'proxima_reunion', type: 'text', nullable: true })
  proximaReunion: string | null;

  @Column({ name: 'duracion', type: 'varchar', length: 5, nullable: true })
  duracion: string | null; // HH:mm

  @Column({ type: 'text', nullable: true })
  desarrollo: string | null;

  @Column({ name: 'acuerdo_informativo', type: 'boolean', default: false })
  acuerdoInformativo: boolean;

  @Column({ name: 'acuerdo_informativo_texto', type: 'text', nullable: true })
  acuerdoInformativoTexto: string | null;

  @Column({ name: 'registrado_por_id', type: 'uuid', nullable: true })
  registradoPorId: string | null;

  @Column({ name: 'registrado_por_nombre', type: 'varchar', length: 300, nullable: true })
  registradoPorNombre: string | null;

  @OneToMany(() => AcuerdoComite, (acuerdo) => acuerdo.reunion)
  acuerdos: AcuerdoComite[];

  @OneToMany(() => AgendaReunion, (agenda) => agenda.reunion)
  agenda: AgendaReunion[];

  @OneToMany(() => DocumentoReunion, (doc) => doc.reunion)
  documentos: DocumentoReunion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
