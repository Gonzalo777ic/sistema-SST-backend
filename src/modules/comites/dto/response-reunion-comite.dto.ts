import { ReunionComite, EstadoReunion, TipoReunion } from '../entities/reunion-comite.entity';
import { safeDateToString, safeDateTimeToDate } from './date-utils';
import { ResponseAgendaReunionDto } from './response-agenda-reunion.dto';

export class ResponseReunionComiteDto {
  id: string;
  comite_id: string;
  comite_nombre?: string; // Para mostrar en frontend
  sesion: string;
  fecha_realizacion: string;
  hora_registro: string | null;
  lugar: string | null;
  descripcion: string | null;
  estado: EstadoReunion;
  tipo_reunion: TipoReunion;
  enviar_alerta: boolean;
  nro_acuerdos?: number; // Calculado
  agenda?: ResponseAgendaReunionDto[];
  registrado_por?: string; // Nombre del usuario que creó la reunión
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    reunion: ReunionComite & {
      acuerdos?: { id: string }[];
      agenda?: any[];
      comite?: { nombre: string };
    }
  ): ResponseReunionComiteDto {
    const dto = new ResponseReunionComiteDto();
    dto.id = reunion.id;
    dto.comite_id = reunion.comiteId;
    dto.comite_nombre = reunion.comite?.nombre;
    dto.sesion = reunion.sesion;
    dto.fecha_realizacion = safeDateToString(reunion.fechaRealizacion) || '';
    dto.hora_registro = reunion.horaRegistro;
    dto.lugar = reunion.lugar;
    dto.descripcion = reunion.descripcion;
    dto.estado = reunion.estado;
    dto.tipo_reunion = reunion.tipoReunion;
    dto.enviar_alerta = reunion.enviarAlerta;
    dto.nro_acuerdos = reunion.acuerdos?.length || 0;
    dto.agenda = reunion.agenda
      ? reunion.agenda.map((item) => ResponseAgendaReunionDto.fromEntity(item)).sort((a, b) => a.orden - b.orden)
      : undefined;
    dto.createdAt = safeDateTimeToDate(reunion.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(reunion.updatedAt) || new Date();
    return dto;
  }
}
