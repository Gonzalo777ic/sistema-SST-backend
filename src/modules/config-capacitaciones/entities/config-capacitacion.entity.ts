import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ResponsableCertificacionItem {
  nombre_completo: string;
  numero_documento: string;
  tipo_documento: string;
}

export interface RegistroAsistenciaItem {
  codigo_documento: string;
  version: string;
  fecha_version: string;
  vigencia_inicio: string;
  vigencia_fin: string;
}

export interface FirmasCertificado {
  responsable_rrhh: boolean;
  responsable_sst: boolean;
  capacitador: boolean;
  responsable_certificacion: boolean;
}

@Entity('config_capacitacion')
export class ConfigCapacitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nota_minima_aprobatoria', type: 'int', default: 11 })
  notaMinimaAprobatoria: number;

  @Column({ name: 'bloquear_evaluacion_nota_menor_igual', type: 'int', default: 0 })
  bloquearEvaluacionNotaMenorIgual: number;

  @Column({ name: 'limite_intentos', type: 'int', default: 3 })
  limiteIntentos: number;

  @Column({ name: 'bloquear_despues_aprobacion', type: 'boolean', default: true })
  bloquearDespuesAprobacion: boolean;

  @Column({ name: 'habilitar_firma_solo_aprobados', type: 'boolean', default: false })
  habilitarFirmaSoloAprobados: boolean;

  @Column({ name: 'habilitar_encuesta_satisfaccion', type: 'boolean', default: false })
  habilitarEncuestaSatisfaccion: boolean;

  @Column({ name: 'tipos', type: 'jsonb', default: () => "'[]'" })
  tipos: string[];

  @Column({ name: 'grupos', type: 'jsonb', default: () => "'[]'" })
  grupos: string[];

  @Column({ name: 'ubicaciones', type: 'jsonb', default: () => "'[]'" })
  ubicaciones: string[];

  @Column({ name: 'responsables_certificacion', type: 'jsonb', default: () => "'[]'" })
  responsablesCertificacion: ResponsableCertificacionItem[];

  @Column({ name: 'registro_asistencia', type: 'jsonb', nullable: true })
  registroAsistencia: RegistroAsistenciaItem[] | null;

  @Column({ name: 'firmas_certificado', type: 'jsonb', nullable: true })
  firmasCertificado: FirmasCertificado | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
