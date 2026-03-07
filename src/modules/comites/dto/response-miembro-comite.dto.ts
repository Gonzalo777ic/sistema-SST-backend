import { MiembroComite, TipoMiembro, RolComite, Representacion } from '../entities/miembro-comite.entity';
import { safeDateTimeToDate } from './date-utils';

export class ResponseMiembroComiteDto {
  id: string;
  comite_id: string;
  trabajador_id: string;
  trabajador_nombre: string | null;
  trabajador_dni: string | null;
  trabajador_cargo: string | null;
  tipo_miembro: TipoMiembro;
  rol_comite: RolComite;
  representacion: Representacion;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(miembro: MiembroComite & {
    trabajador?: { nombreCompleto: string; documentoIdentidad: string; cargo?: string | null; cargoRef?: { nombre: string } | null };
  }): ResponseMiembroComiteDto {
    const dto = new ResponseMiembroComiteDto();
    dto.id = miembro.id;
    dto.comite_id = miembro.comiteId;
    dto.trabajador_id = miembro.trabajadorId;
    dto.trabajador_nombre = miembro.trabajador?.nombreCompleto || null;
    dto.trabajador_dni = miembro.trabajador?.documentoIdentidad || null;
    dto.trabajador_cargo = miembro.trabajador?.cargoRef?.nombre ?? miembro.trabajador?.cargo ?? null;
    dto.tipo_miembro = miembro.tipoMiembro;
    dto.rol_comite = miembro.rolComite;
    dto.representacion = miembro.representacion;
    // Fechas de tipo 'datetime' (con hora) - convertir a Date de forma segura
    dto.createdAt = safeDateTimeToDate(miembro.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(miembro.updatedAt) || new Date();
    return dto;
  }
}
