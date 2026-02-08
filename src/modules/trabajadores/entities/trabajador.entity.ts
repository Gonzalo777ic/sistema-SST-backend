import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Area } from '../../empresas/entities/area.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum EstadoTrabajador {
  Activo = 'Activo',
  Inactivo = 'Inactivo',
  Vacaciones = 'Vacaciones',
  Licencia = 'Licencia',
}

export enum GrupoSanguineo {
  'A+' = 'A+',
  'A-' = 'A-',
  'B+' = 'B+',
  'B-' = 'B-',
  'AB+' = 'AB+',
  'AB-' = 'AB-',
  'O+' = 'O+',
  'O-' = 'O-',
}

@Entity('trabajadores')
@Index(['documentoIdentidad', 'empresaId'], { unique: true })
export class Trabajador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre_completo' })
  nombreCompleto: string;

  @Column({ name: 'documento_identidad' })
  documentoIdentidad: string;

  @Column({ name: 'foto_url', nullable: true })
  fotoUrl: string | null;

  @Column({ name: 'email_personal', nullable: true })
  emailPersonal: string | null;

  @Column({ nullable: true })
  telefono: string | null;

  @Column({ name: 'contacto_emergencia_nombre', nullable: true })
  contactoEmergenciaNombre: string | null;

  @Column({ name: 'contacto_emergencia_telefono', nullable: true })
  contactoEmergenciaTelefono: string | null;

  @Column()
  cargo: string;

  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso: Date;

  @Column({
    type: 'enum',
    enum: EstadoTrabajador,
    default: EstadoTrabajador.Activo,
  })
  estado: EstadoTrabajador;

  @Column({
    name: 'grupo_sanguineo',
    type: 'enum',
    enum: GrupoSanguineo,
    nullable: true,
  })
  grupoSanguineo: GrupoSanguineo | null;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.trabajadores, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area | null;

  @OneToOne(() => Usuario, (usuario) => usuario.trabajador, { nullable: true })
  usuario: Usuario | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
