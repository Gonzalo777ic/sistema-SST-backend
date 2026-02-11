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
import { Empresa } from '../../empresas/entities/empresa.entity';
import { SolicitudEPPDetalle } from './solicitud-epp-detalle.entity';

export enum TipoProteccionEPP {
  Manos = 'Manos',
  Cuerpo = 'Cuerpo',
  Auditiva = 'Auditiva',
  Visual = 'Visual',
  Cabeza = 'Cabeza',
  Pies = 'Pies',
  Pierna = 'Pierna',
  Otros = 'Otros',
}

export enum CategoriaEPP {
  EPP = 'EPP',
  Uniforme = 'Uniforme',
}

export enum VigenciaEPP {
  UnMes = '1 mes',
  DosMeses = '2 meses',
  TresMeses = '3 meses',
  CuatroMeses = '4 meses',
  CincoMeses = '5 meses',
  SeisMeses = '6 meses',
  SieteMeses = '7 meses',
  OchoMeses = '8 meses',
  NueveMeses = '9 meses',
  DiezMeses = '10 meses',
  OnceMeses = '11 meses',
  UnAnio = '1 año',
  DosAnios = '2 años',
}

@Entity('epp')
export class EPP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({
    name: 'tipo_proteccion',
    type: 'enum',
    enum: TipoProteccionEPP,
  })
  tipoProteccion: TipoProteccionEPP;

  @Column({
    type: 'enum',
    enum: CategoriaEPP,
    default: CategoriaEPP.EPP,
  })
  categoria: CategoriaEPP;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'imagen_url', type: 'text', nullable: true })
  imagenUrl: string | null;

  @Column({
    name: 'vigencia',
    type: 'enum',
    enum: VigenciaEPP,
    nullable: true,
  })
  vigencia: VigenciaEPP | null;

  @Column({ name: 'adjunto_pdf_url', type: 'text', nullable: true })
  adjuntoPdfUrl: string | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @OneToMany(() => SolicitudEPPDetalle, (detalle) => detalle.epp)
  detalles: SolicitudEPPDetalle[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
