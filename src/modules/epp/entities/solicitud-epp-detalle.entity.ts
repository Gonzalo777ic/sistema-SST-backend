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

  @Column({ type: 'int', default: 1 })
  cantidad: number;

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
