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

  @Column({ name: 'foto_url', type: 'varchar', nullable: true })
  fotoUrl: string | null;

  @Column({ name: 'email_personal', type: 'varchar', nullable: true })
  emailPersonal: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  @Column({ name: 'contacto_emergencia_nombre', type: 'varchar', nullable: true })
  contactoEmergenciaNombre: string | null;

  @Column({ name: 'contacto_emergencia_telefono', type: 'varchar', nullable: true })
  contactoEmergenciaTelefono: string | null;

  @Column({ type: 'varchar' })
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

  @Column({ name: 'talla_casco', type: 'varchar', nullable: true })
  tallaCasco: string | null;

  @Column({ name: 'talla_camisa', type: 'varchar', nullable: true })
  tallaCamisa: string | null;

  @Column({ name: 'talla_pantalon', type: 'varchar', nullable: true })
  tallaPantalon: string | null;

  @Column({ name: 'talla_calzado', type: 'int', nullable: true })
  tallaCalzado: number | null;

  @Column({ name: 'perfil_completado', type: 'boolean', default: false })
  perfilCompletado: boolean;

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
