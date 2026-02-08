import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Capacitacion } from './capacitacion.entity';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { ResultadoExamen } from './resultado-examen.entity';

export enum EstadoCertificado {
  PendienteFirmaTrabajador = 'Pendiente Firma Trabajador',
  PendienteFirmaSupervisor = 'Pendiente Firma Supervisor',
  Emitido = 'Emitido',
}

@Entity('certificados_capacitacion')
@Index(['trabajadorId', 'capacitacionId'], { unique: true })
export class CertificadoCapacitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_certificado', type: 'varchar', unique: true })
  numeroCertificado: string;

  @Column({
    type: 'enum',
    enum: EstadoCertificado,
    default: EstadoCertificado.PendienteFirmaTrabajador,
  })
  estado: EstadoCertificado;

  // Snapshots de Capacitación
  @Column({ name: 'capacitacion_id', type: 'uuid' })
  capacitacionId: string;

  @ManyToOne(() => Capacitacion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'capacitacion_id' })
  capacitacion: Capacitacion;

  @Column({ name: 'capacitacion_titulo', type: 'varchar' })
  capacitacionTitulo: string;

  @Column({ name: 'fecha_capacitacion', type: 'date' })
  fechaCapacitacion: Date;

  @Column({ name: 'duracion_horas', type: 'decimal', precision: 4, scale: 2 })
  duracionHoras: number;

  @Column({ type: 'varchar' })
  instructor: string;

  @Column({ name: 'puntaje_examen', type: 'decimal', precision: 5, scale: 2 })
  puntajeExamen: number;

  // Snapshots de Trabajador
  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @ManyToOne(() => Trabajador, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador: Trabajador;

  @Column({ name: 'trabajador_nombre', type: 'varchar' })
  trabajadorNombre: string;

  @Column({ name: 'trabajador_documento', type: 'varchar' })
  trabajadorDocumento: string;

  @Column({ name: 'trabajador_email', type: 'varchar', nullable: true })
  trabajadorEmail: string | null;

  // Firmas
  @Column({ name: 'firma_trabajador_url', type: 'varchar', nullable: true })
  firmaTrabajadorUrl: string | null;

  @Column({ name: 'fecha_firma_trabajador', type: 'timestamptz', nullable: true })
  fechaFirmaTrabajador: Date | null;

  @Column({ name: 'supervisor_nombre', type: 'varchar', nullable: true })
  supervisorNombre: string | null;

  @Column({ name: 'firma_supervisor_url', type: 'varchar', nullable: true })
  firmaSupervisorUrl: string | null;

  @Column({ name: 'fecha_firma_supervisor', type: 'timestamptz', nullable: true })
  fechaFirmaSupervisor: Date | null;

  @Column({ name: 'pdf_url', type: 'varchar', nullable: true })
  pdfUrl: string | null;

  // Relación con ResultadoExamen
  @Column({ name: 'resultado_examen_id', type: 'uuid', nullable: true })
  resultadoExamenId: string | null;

  @OneToOne(() => ResultadoExamen, (resultado) => resultado.certificado, {
    nullable: true,
  })
  @JoinColumn({ name: 'resultado_examen_id' })
  resultadoExamen: ResultadoExamen | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
