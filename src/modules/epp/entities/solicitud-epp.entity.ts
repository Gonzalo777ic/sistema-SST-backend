import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Area } from '../../empresas/entities/area.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

export enum TipoEPP {
  Casco = 'Casco',
  ChalecoReflectivo = 'Chaleco Reflectivo',
  Guantes = 'Guantes',
  BotasSeguridad = 'Botas de Seguridad',
  LentesSeguridad = 'Lentes de Seguridad',
  ProteccionAuditiva = 'Protección Auditiva',
  Arnes = 'Arnés',
  Respirador = 'Respirador',
  ProtectorFacial = 'Protector Facial',
  Otro = 'Otro',
}

export enum MotivoEPP {
  NuevoIngreso = 'Nuevo Ingreso',
  ReposicionDesgaste = 'Reposición por Desgaste',
  Perdida = 'Pérdida',
  Dano = 'Daño',
  CambioTalla = 'Cambio de Talla',
  Otro = 'Otro',
}

export enum EstadoSolicitudEPP {
  Pendiente = 'Pendiente',
  Aprobada = 'Aprobada',
  Rechazada = 'Rechazada',
  Entregada = 'Entregada',
}

@Entity('solicitudes_epp')
export class SolicitudEPP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fecha_solicitud', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaSolicitud: Date;

  @Column({
    name: 'tipo_epp',
    type: 'enum',
    enum: TipoEPP,
  })
  tipoEpp: TipoEPP;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ type: 'varchar', length: 20 })  talla: string;

  @Column({
    type: 'enum',
    enum: MotivoEPP,
  })
  motivo: MotivoEPP;

  @Column({ name: 'descripcion_motivo', type: 'text', nullable: true })
  descripcionMotivo: string | null;

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

  // Relaciones
  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
