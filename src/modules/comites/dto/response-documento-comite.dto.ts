import { DocumentoComite } from '../entities/documento-comite.entity';
import { safeDateToString, safeDateTimeToDate } from './date-utils';

export class ResponseDocumentoComiteDto {
  id: string;
  comite_id: string;
  titulo: string;
  url: string;
  fecha_registro: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(documento: DocumentoComite): ResponseDocumentoComiteDto {
    const dto = new ResponseDocumentoComiteDto();
    dto.id = documento.id;
    dto.comite_id = documento.comiteId;
    dto.titulo = documento.titulo;
    dto.url = documento.url;
    // Fecha de registro es de tipo 'date' (solo fecha, sin hora)
    dto.fecha_registro = safeDateToString(documento.fechaRegistro) || '';
    // Fechas de tipo 'datetime' (con hora) - convertir a Date de forma segura
    dto.createdAt = safeDateTimeToDate(documento.createdAt) || new Date();
    dto.updatedAt = safeDateTimeToDate(documento.updatedAt) || new Date();
    return dto;
  }
}
