import { MarcoNormativo } from '../entities/marco-normativo.entity';
import { safeDateTimeToDate } from '../../comites/dto/date-utils';

type MarcoConDocumentos = MarcoNormativo & {
  documentos?: Array<{
    id: string;
    nombre: string;
    archivoUrl: string;
    version: string | null;
    activo?: boolean;
  }>;
};

export class ResponseMarcoNormativoDto {
  id: string;
  empresa_propietaria_id: string | null;
  empresas_vinculadas: string[]; // IDs de empresas que pueden usar este marco
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  documentos: Array<{
    id: string;
    nombre: string;
    archivo_url: string;
    version: string | null;
    activo: boolean;
  }>;
  createdAt: Date;

  static fromEntity(marco: MarcoConDocumentos & { empresasVinculadas?: string[] }): ResponseMarcoNormativoDto {
    const dto = new ResponseMarcoNormativoDto();
    dto.id = marco.id;
    dto.empresa_propietaria_id = marco.empresaPropietariaId ?? null;
    dto.empresas_vinculadas = marco.empresasVinculadas ?? [];
    dto.nombre = marco.nombre;
    dto.descripcion = marco.descripcion;
    dto.activo = marco.activo;
    dto.documentos = (marco.documentos || []).map((d) => ({
      id: d.id,
      nombre: d.nombre,
      archivo_url: d.archivoUrl,
      version: d.version,
      activo: d.activo !== false,
    }));
    dto.createdAt = safeDateTimeToDate(marco.createdAt) || new Date();
    return dto;
  }
}
