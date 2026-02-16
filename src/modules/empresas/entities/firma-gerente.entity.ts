import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from './empresa.entity';

export type RolGerente = 'RRHH' | 'SST' | 'MO' | 'CERTIFICACION' | string;

@Entity('firmas_gerente')
export class FirmaGerente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  /** Usuario (ADMIN/SUPER_ADMIN) o Trabajador - uno de los dos */
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string | null;

  @Column({ name: 'trabajador_id', type: 'uuid', nullable: true })
  trabajadorId: string | null;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 300 })
  nombreCompleto: string;

  @Column({ name: 'numero_documento', type: 'varchar', length: 20 })
  numeroDocumento: string;

  @Column({ name: 'tipo_documento', type: 'varchar', length: 50, default: 'DNI' })
  tipoDocumento: string;

  @Column({ name: 'rol', type: 'varchar', length: 50 })
  rol: RolGerente;

  @Column({ name: 'cargo', type: 'varchar', length: 200 })
  cargo: string;

  @Column({ name: 'firma_url', type: 'text', nullable: true })
  firmaUrl: string | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
