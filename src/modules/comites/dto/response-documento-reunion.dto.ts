import { DocumentoReunion } from '../entities/documento-reunion.entity';
import { safeDateTimeToDate } from './date-utils';

export class ResponseDocumentoReunionDto {
  id: string;
  reunion_id: string;
  titulo: string;
  url: string;
  fecha_registro: string;
  registrado_por: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(doc: DocumentoReunion): ResponseDocumentoReunionDto {
    const dto = new ResponseDocumentoReunionDto();
    dto.id = doc.id;
    dto.reunion_id = doc.reunionId;
    dto.titulo = doc.titulo;
    dto.url = doc.url;
    const dt = safeDateTimeToDate(doc.fechaRegistro);
    dto.fecha_registro = dt ? dt.toISOString() : '';
    dto.registrado_por = doc.registradoPorNombre ?? null;
    dto.createdAt = safeDateTimeToDate(doc.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(doc.updatedAt) || new Date();
    return dto;
  }
}
