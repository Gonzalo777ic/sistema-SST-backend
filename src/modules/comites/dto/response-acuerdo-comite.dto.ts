import { AcuerdoComite, TipoAcuerdo, EstadoAcuerdo } from '../entities/acuerdo-comite.entity';
import { safeDateToString, safeDateTimeToDate } from './date-utils';

export interface ResponsableInfo {
  id: string;
  nombre: string;
  dni?: string;
  puesto?: string;
  area?: string;
}

export class ResponseAcuerdoComiteDto {
  id: string;
  reunion_id: string;
  titulo: string;
  descripcion?: string;
  tipo_acuerdo: TipoAcuerdo;
  fecha_programada: string | null;
  fecha_real: string | null;
  estado: EstadoAcuerdo;
  responsables: ResponsableInfo[];
  observaciones: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    acuerdo: AcuerdoComite & {
      responsables?: Array<{
        responsable: {
          id: string;
          nombreCompleto: string;
          documentoIdentidad?: string;
          cargo: string | null;
          area?: { nombre: string } | null;
        };
      }>;
    }
  ): ResponseAcuerdoComiteDto {
    const dto = new ResponseAcuerdoComiteDto();
    dto.id = acuerdo.id;
    dto.reunion_id = acuerdo.reunionId;
    dto.titulo = acuerdo.titulo;
    dto.descripcion = acuerdo.descripcion || undefined;
    dto.tipo_acuerdo = acuerdo.tipoAcuerdo;
    dto.fecha_programada = acuerdo.fechaProgramada ? safeDateToString(acuerdo.fechaProgramada) : null;
    dto.fecha_real = acuerdo.fechaReal ? safeDateToString(acuerdo.fechaReal) : null;
    dto.estado = acuerdo.estado;
    dto.responsables =
      acuerdo.responsables?.map((ar) => ({
        id: ar.responsable.id,
        nombre: ar.responsable.nombreCompleto,
        dni: ar.responsable.documentoIdentidad,
        puesto: ar.responsable.cargo ?? undefined,
        area: ar.responsable.area && ar.responsable.area.nombre ? ar.responsable.area.nombre : undefined,
      })) || [];
    dto.observaciones = acuerdo.observaciones;
    dto.createdAt = safeDateTimeToDate(acuerdo.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(acuerdo.updatedAt) || new Date();
    return dto;
  }
}
