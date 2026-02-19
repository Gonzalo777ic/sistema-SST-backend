import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Area } from './area.entity';
import { Unidad } from './unidad.entity';
import { Sede } from './sede.entity';
import { Gerencia } from './gerencia.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar', unique: true, length: 11 })
  ruc: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  direccion: string | null;

  @Column({ name: 'actividad_economica', type: 'varchar', length: 500, nullable: true })
  actividadEconomica: string | null;

  @Column({ name: 'numero_trabajadores', type: 'int', default: 0 })
  numeroTrabajadores: number;

  @Column({ name: 'logo_url', type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => Usuario, (usuario) => usuario.empresa)
  usuarios: Usuario[];

  @OneToMany('Trabajador', 'empresa')
  trabajadores: import('../../trabajadores/entities/trabajador.entity').Trabajador[];

  @OneToMany(() => Area, (area) => area.empresa)
  areas: Area[];

  @OneToMany(() => Unidad, (unidad) => unidad.empresa)
  unidades: Unidad[];

  @OneToMany(() => Sede, (sede) => sede.empresa)
  sedes: Sede[];

  @OneToMany(() => Gerencia, (gerencia) => gerencia.empresa)
  gerencias: Gerencia[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
