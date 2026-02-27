import { Comite } from '../entities/comite.entity';
import { RolComite } from '../entities/miembro-comite.entity';
import { safeDateToString, safeDateTimeToDate } from './date-utils';

type ComiteConMiembros = Comite & {
  miembros?: Array<{
    rolComite: RolComite;
    trabajador?: { nombreCompleto: string } | null;
  }>;
};

export class ResponseComiteDto {
  id: string;
  empresa_id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string | null;
  nro_miembros: number;
  activo: boolean;
  presidente_nombre: string | null;
  registrado_por: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(comite: ComiteConMiembros): ResponseComiteDto {
    const dto = new ResponseComiteDto();
    dto.id = comite.id;
    dto.empresa_id = comite.empresaId;
    dto.nombre = comite.nombre;
    // Fechas de tipo 'date' (solo fecha, sin hora)
    dto.fecha_inicio = safeDateToString(comite.fechaInicio) || '';
    dto.fecha_fin = safeDateToString(comite.fechaFin) || '';
    dto.descripcion = comite.descripcion;
    dto.nro_miembros = comite.nroMiembros;
    dto.activo = comite.activo;
    // Presidente: miembro con rol PRESIDENTE
    const presidente = comite.miembros?.find((m) => m.rolComite === RolComite.PRESIDENTE);
    dto.presidente_nombre = presidente?.trabajador?.nombreCompleto ?? null;
    dto.registrado_por = comite.registradoPorNombre ?? null;
    // Fechas de tipo 'datetime' (con hora) - convertir a Date de forma segura
    dto.createdAt = safeDateTimeToDate(comite.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(comite.updatedAt) || new Date();
    return dto;
  }
}
