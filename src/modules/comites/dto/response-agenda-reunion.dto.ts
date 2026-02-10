import { AgendaReunion } from '../entities/agenda-reunion.entity';
import { safeDateTimeToDate } from './date-utils';

export class ResponseAgendaReunionDto {
  id: string;
  reunion_id: string;
  descripcion: string;
  orden: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(agenda: AgendaReunion): ResponseAgendaReunionDto {
    const dto = new ResponseAgendaReunionDto();
    dto.id = agenda.id;
    dto.reunion_id = agenda.reunionId;
    dto.descripcion = agenda.descripcion;
    dto.orden = agenda.orden;
    dto.createdAt = safeDateTimeToDate(agenda.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(agenda.updatedAt) || new Date();
    return dto;
  }
}
