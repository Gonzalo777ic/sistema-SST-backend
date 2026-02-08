import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Area } from '../../empresas/entities/area.entity';
import { HallazgoInspeccion } from './hallazgo-inspeccion.entity';

export enum TipoInspeccion {
  SeguridadGeneral = 'Seguridad General',
  EPP = 'EPP',
  EquiposMaquinaria = 'Equipos y Maquinaria',
  OrdenLimpieza = 'Orden y Limpieza',
  Ambiental = 'Ambiental',
  Ergonómica = 'Ergonómica',
  Vehiculos = 'Vehículos',
}

export enum EstadoInspeccion {
  Planificada = 'Planificada',
  Completada = 'Completada',
  ConHallazgosPendientes = 'Con Hallazgos Pendientes',
}

@Entity('inspecciones')
export class Inspeccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tipo_inspeccion',
    type: 'enum',
    enum: TipoInspeccion,
  })
  tipoInspeccion: TipoInspeccion;

  @Column({ name: 'fecha_inspeccion', type: 'date' })
  fechaInspeccion: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  puntuacion: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ name: 'fotos_generales', type: 'simple-array', nullable: true })
  fotosGenerales: string[] | null;

  @Column({
    type: 'enum',
    enum: EstadoInspeccion,
    default: EstadoInspeccion.Planificada,
  })
  estado: EstadoInspeccion;

  // Relaciones
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area | null;

  @Column({ name: 'inspector_id', type: 'uuid' })
  inspectorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inspector_id' })
  inspector: Usuario;

  @OneToMany(() => HallazgoInspeccion, (hallazgo) => hallazgo.inspeccion, {
    cascade: true,
  })
  hallazgos: HallazgoInspeccion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
