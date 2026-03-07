import { ReunionComite, EstadoReunion, TipoReunion } from '../entities/reunion-comite.entity';
import { safeDateToString, safeDateTimeToDate } from './date-utils';
import { ResponseAgendaReunionDto } from './response-agenda-reunion.dto';
import { ResponseDocumentoReunionDto } from './response-documento-reunion.dto';

export class ResponseReunionComiteDto {
  id: string;
  comite_id: string;
  comite_nombre?: string;
  sesion: string;
  fecha_realizacion: string;
  hora_registro: string | null;
  lugar: string | null;
  descripcion: string | null;
  estado: EstadoReunion;
  tipo_reunion: TipoReunion;
  enviar_alerta: boolean;
  numero_reunion: string | null;
  proxima_reunion: string | null;
  duracion: string | null;
  desarrollo: string | null;
  acuerdo_informativo: boolean;
  acuerdo_informativo_texto: string | null;
  nro_acuerdos?: number;
  agenda?: ResponseAgendaReunionDto[];
  documentos?: ResponseDocumentoReunionDto[];
  registrado_por?: string;
  registrado_por_rol?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    reunion: ReunionComite & {
      acuerdos?: { id: string }[];
      agenda?: any[];
      comite?: { nombre: string };
      documentos?: any[];
    }
  ): ResponseReunionComiteDto {
    const dto = new ResponseReunionComiteDto();
    dto.id = reunion.id;
    dto.comite_id = reunion.comiteId;
    dto.comite_nombre = reunion.comite?.nombre;
    dto.sesion = reunion.sesion;
    dto.fecha_realizacion = safeDateToString(reunion.fechaRealizacion) || '';
    dto.hora_registro = reunion.horaRegistro ?? null;
    dto.lugar = reunion.lugar ?? null;
    dto.descripcion = reunion.descripcion ?? null;
    dto.estado = reunion.estado;
    dto.tipo_reunion = reunion.tipoReunion;
    dto.enviar_alerta = reunion.enviarAlerta;
    dto.numero_reunion = reunion.numeroReunion ?? null;
    dto.proxima_reunion = reunion.proximaReunion ?? null;
    dto.duracion = reunion.duracion ?? null;
    dto.desarrollo = reunion.desarrollo ?? null;
    dto.acuerdo_informativo = reunion.acuerdoInformativo ?? false;
    dto.acuerdo_informativo_texto = reunion.acuerdoInformativoTexto ?? null;
    dto.nro_acuerdos = reunion.acuerdos?.length || 0;
    dto.agenda = reunion.agenda
      ? reunion.agenda.map((item) => ResponseAgendaReunionDto.fromEntity(item)).sort((a, b) => a.orden - b.orden)
      : undefined;
    dto.documentos = reunion.documentos
      ? reunion.documentos.map((doc) => ResponseDocumentoReunionDto.fromEntity(doc))
      : undefined;
    dto.registrado_por = reunion.registradoPorNombre ?? undefined;
    dto.createdAt = safeDateTimeToDate(reunion.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(reunion.updatedAt) || new Date();
    return dto;
  }
}
