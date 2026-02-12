import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Area } from '../../empresas/entities/area.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { SolicitudEPPDetalle } from './solicitud-epp-detalle.entity';

export enum EstadoSolicitudEPP {
  Pendiente = 'PENDIENTE',
  Observada = 'OBSERVADA',
  Aprobada = 'APROBADA',
  Entregada = 'ENTREGADA',
  Rechazada = 'RECHAZADA',
}

@Entity('solicitudes_epp')
export class SolicitudEPP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'codigo_correlativo', type: 'varchar', length: 50, unique: true, nullable: true })
  codigoCorrelativo: string | null;

  @Column({ name: 'fecha_solicitud', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaSolicitud: Date;

  @Column({ name: 'motivo', type: 'text', nullable: true })
  motivo: string | null;

  @Column({ name: 'centro_costos', type: 'varchar', length: 100, nullable: true })
  centroCostos: string | null;

  @Column({ name: 'comentarios', type: 'text', nullable: true })
  comentarios: string | null;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string | null;

  @Column({
    type: 'enum',
    enum: EstadoSolicitudEPP,
    default: EstadoSolicitudEPP.Pendiente,
  })
  estado: EstadoSolicitudEPP;

  // Aprobación
  @Column({ name: 'supervisor_aprobador_id', type: 'uuid', nullable: true })
  supervisorAprobadorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisor_aprobador_id' })
  supervisorAprobador: Usuario | null;

  @Column({ name: 'fecha_aprobacion', type: 'timestamptz', nullable: true })
  fechaAprobacion: Date | null;

  @Column({ name: 'comentarios_aprobacion', type: 'text', nullable: true })
  comentariosAprobacion: string | null;

  // Entrega
  @Column({ name: 'entregado_por_id', type: 'uuid', nullable: true })
  entregadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'entregado_por_id' })
  entregadoPor: Usuario | null;

  @Column({ name: 'fecha_entrega', type: 'timestamptz', nullable: true })
  fechaEntrega: Date | null;

  @Column({ name: 'firma_recepcion_url', type: 'text', nullable: true })
  firmaRecepcionUrl: string | null;

  @Column({ name: 'registro_entrega_pdf_url', type: 'text', nullable: true })
  registroEntregaPdfUrl: string | null;

  // Relaciones
  @Column({ name: 'usuario_epp_id', type: 'uuid' })
  usuarioEppId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_epp_id' })
  usuarioEpp: Usuario;

  @Column({ name: 'solicitante_id', type: 'uuid' })
  solicitanteId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'solicitante_id' })
  solicitante: Trabajador;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area | null;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @OneToMany(() => SolicitudEPPDetalle, (detalle) => detalle.solicitudEpp, {
    cascade: true,
  })
  detalles: SolicitudEPPDetalle[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
