import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { SolicitudEPP } from './solicitud-epp.entity';
import { EPP } from './epp.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('solicitudes_epp_detalle')
export class SolicitudEPPDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'solicitud_epp_id', type: 'uuid' })
  solicitudEppId: string;

  @ManyToOne(() => SolicitudEPP, (solicitud) => solicitud.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitud_epp_id' })
  solicitudEpp: SolicitudEPP;

  @Column({ name: 'epp_id', type: 'uuid' })
  eppId: string;

  @ManyToOne(() => EPP, (epp) => epp.detalles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'epp_id' })
  epp: EPP;

  /** Snapshot histórico: datos del EPP en el momento de la transacción (consistencia temporal) */
  @Column({ name: 'epp_nombre_historico', type: 'varchar', length: 200, nullable: true })
  eppNombreHistorico: string | null;

  @Column({ name: 'epp_tipo_proteccion_historico', type: 'varchar', length: 50, nullable: true })
  eppTipoProteccionHistorico: string | null;

  @Column({ name: 'epp_categoria_historica', type: 'varchar', length: 50, nullable: true })
  eppCategoriaHistorica: string | null;

  @Column({ name: 'epp_descripcion_historica', type: 'text', nullable: true })
  eppDescripcionHistorica: string | null;

  @Column({ name: 'epp_vigencia_historica', type: 'varchar', length: 50, nullable: true })
  eppVigenciaHistorica: string | null;

  @Column({ name: 'epp_imagen_url_historica', type: 'text', nullable: true })
  eppImagenUrlHistorica: string | null;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ name: 'codigo_auditoria', type: 'varchar', length: 20, nullable: true })
  codigoAuditoria: string | null;

  @Column({ name: 'firma_trabajador_url', type: 'text', nullable: true })
  firmaTrabajadorUrl: string | null;

  @Column({ name: 'fecha_hora_entrega', type: 'timestamptz', nullable: true })
  fechaHoraEntrega: Date | null;

  @Column({ type: 'boolean', default: false })
  exceptuado: boolean;

  @Column({ name: 'exceptuado_por_id', type: 'uuid', nullable: true })
  exceptuadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'exceptuado_por_id' })
  exceptuadoPor: Usuario | null;

  @Column({ type: 'boolean', default: false })
  agregado: boolean;

  @Column({ name: 'agregado_por_id', type: 'uuid', nullable: true })
  agregadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'agregado_por_id' })
  agregadoPor: Usuario | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
