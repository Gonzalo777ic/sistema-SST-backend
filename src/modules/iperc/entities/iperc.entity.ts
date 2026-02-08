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
import { LineaIPERC } from './linea-iperc.entity';

export enum EstadoIPERC {
  Borrador = 'Borrador',
  Completado = 'Completado',
  Aprobado = 'Aprobado',
  Rechazado = 'Rechazado',
}

@Entity('iperc')
export class IPERC {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'razon_social', type: 'varchar' })
  razonSocial: string;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: Area | null;

  @Column({ type: 'varchar' })
  proceso: string;

  @Column({ name: 'fecha_elaboracion', type: 'date' })
  fechaElaboracion: Date;

  @Column({
    type: 'enum',
    enum: EstadoIPERC,
    default: EstadoIPERC.Borrador,
  })
  estado: EstadoIPERC;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string | null;

  @Column({ name: 'historial_versiones', type: 'jsonb', nullable: true })
  historialVersiones: any[] | null;

  @Column({ name: 'firma_elaborador', type: 'text', nullable: true })
  firmaElaborador: string | null;

  @Column({ name: 'firma_aprobador', type: 'text', nullable: true })
  firmaAprobador: string | null;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'elaborado_por_id', type: 'uuid' })
  elaboradoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'elaborado_por_id' })
  elaboradoPor: Usuario;

  @Column({ name: 'aprobado_por_id', type: 'uuid', nullable: true })
  aprobadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'aprobado_por_id' })
  aprobadoPor: Usuario | null;

  @OneToMany(() => LineaIPERC, (linea) => linea.iperc, {
    cascade: true,
  })
  lineasIperc: LineaIPERC[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}