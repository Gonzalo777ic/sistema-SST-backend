import { DocumentoNormativo } from '../entities/documento-normativo.entity';

export class ResponseDocumentoNormativoDto {
  id: string;
  marco_normativo_id: string;
  nombre: string;
  archivo_url: string;
  version: string | null;

  static fromEntity(doc: DocumentoNormativo): ResponseDocumentoNormativoDto {
    const dto = new ResponseDocumentoNormativoDto();
    dto.id = doc.id;
    dto.marco_normativo_id = doc.marcoNormativoId;
    dto.nombre = doc.nombre;
    dto.archivo_url = doc.archivoUrl;
    dto.version = doc.version;
    return dto;
  }
}
