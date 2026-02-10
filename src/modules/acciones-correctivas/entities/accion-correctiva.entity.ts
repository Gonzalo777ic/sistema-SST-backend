import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Area } from '../../empresas/entities/area.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Contratista } from '../../contratistas/entities/contratista.entity';
import { Incidente } from '../../incidentes/entities/incidente.entity';

export enum FuenteAccion {
  Accidentes = 'Accidentes',
  Inspecciones = 'Inspecciones',
  ActosCondiciones = 'Actos y Condiciones',
  Acuerdos = 'Acuerdos',
  Monitoreo = 'Monitoreo',
}

export enum EstadoAccion {
  PorAprobar = 'POR APROBAR',
  Aprobado = 'APROBADO',
  Atrasado = 'ATRASADO',
  Pendiente = 'PENDIENTE',
  Desaprobado = 'DESAPROBADO',
}

@Entity('acciones_correctivas')
export class AccionCorrectiva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FuenteAccion,
  })
  fuente: FuenteAccion;

  @Column({ type: 'varchar', length: 500 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'fecha_programada', type: 'date' })
  fechaProgramada: Date;

  @Column({ name: 'fecha_ejecucion', type: 'date', nullable: true })
  fechaEjecucion: Date | null;

  @Column({ name: 'fecha_aprobacion', type: 'date', nullable: true })
  fechaAprobacion: Date | null;

  @Column({
    type: 'enum',
    enum: EstadoAccion,
    default: EstadoAccion.PorAprobar,
  })
  estado: EstadoAccion;

  @Column({ name: 'sede', type: 'varchar', length: 200, nullable: true })
  sede: string | null;

  @Column({ name: 'unidad', type: 'varchar', length: 200, nullable: true })
  unidad: string | null;

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

  @Column({ name: 'elaborado_por_id', type: 'uuid' })
  elaboradoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'elaborado_por_id' })
  elaboradoPor: Usuario;

  @Column({ name: 'responsable_levantamiento_id', type: 'uuid' })
  responsableLevantamientoId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'responsable_levantamiento_id' })
  responsableLevantamiento: Trabajador;

  @Column({ name: 'contratista_id', type: 'uuid', nullable: true })
  contratistaId: string | null;

  @ManyToOne(() => Contratista, { nullable: true })
  @JoinColumn({ name: 'contratista_id' })
  contratista: Contratista | null;

  @Column({ name: 'incidente_id', type: 'uuid', nullable: true })
  incidenteId: string | null;

  @ManyToOne(() => Incidente, { nullable: true })
  @JoinColumn({ name: 'incidente_id' })
  incidente: Incidente | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
