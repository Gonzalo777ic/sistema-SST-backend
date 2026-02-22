import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Log de auditoría para accesos a documentos médicos (URLs firmadas).
 * Solo inserción - nunca se edita ni elimina (integridad legal).
 */
@Entity('auditoria_acceso_documento')
export class AuditoriaAccesoDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fecha_hora', type: 'timestamptz' })
  fechaHora: Date;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @Column({ name: 'usuario_nombre', type: 'varchar', length: 200 })
  usuarioNombre: string;

  @Column({ name: 'accion', type: 'varchar', length: 50 })
  accion: string;

  @Column({ name: 'recurso_tipo', type: 'varchar', length: 50 })
  recursoTipo: string;

  @Column({ name: 'recurso_id', type: 'uuid' })
  recursoId: string;

  @Column({ name: 'recurso_descripcion', type: 'varchar', length: 500 })
  recursoDescripcion: string;

  @Column({ name: 'examen_id', type: 'uuid' })
  examenId: string;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId: string;

  @Column({ name: 'trabajador_nombre', type: 'varchar', length: 300 })
  trabajadorNombre: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;
}
