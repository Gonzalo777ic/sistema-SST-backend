import { Comite } from '../entities/comite.entity';
import { safeDateToString, safeDateTimeToDate } from './date-utils';

export class ResponseComiteDto {
  id: string;
  empresa_id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string | null;
  nro_miembros: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(comite: Comite): ResponseComiteDto {
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
    // Fechas de tipo 'datetime' (con hora) - convertir a Date de forma segura
    dto.createdAt = safeDateTimeToDate(comite.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(comite.updatedAt) || new Date();
    return dto;
  }
}
