import { CategoriaDocumento } from '../entities/documento-sst.entity';

export class ResponseDocumentoSstDto {
  id: string;
  titulo: string;
  descripcion: string;
  version: string;
  categoria: CategoriaDocumento;
  archivo_url: string;
  formato: string;
  tamano: number | null;
  fecha_publicacion: string;
  activo: boolean;
  descargas_count: number;
  empresa_id: string;
  subido_por: string | null;
  subido_por_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(documento: {
    id: string;
    titulo: string;
    descripcion: string;
    version: string;
    categoria: CategoriaDocumento;
    archivoUrl: string;
    formato: string;
    tamano: number | null;
    fechaPublicacion: Date;
    activo: boolean;
    descargasCount: number;
    empresaId: string;
    subidoPorId: string;
    subidoPor?: { nombreCompleto?: string; dni?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseDocumentoSstDto {
    const dto = new ResponseDocumentoSstDto();
    dto.id = documento.id;
    dto.titulo = documento.titulo;
    dto.descripcion = documento.descripcion;
    dto.version = documento.version;
    dto.categoria = documento.categoria;
    dto.archivo_url = documento.archivoUrl;
    dto.formato = documento.formato;
    dto.tamano = documento.tamano;
    dto.fecha_publicacion = documento.fechaPublicacion.toISOString().split('T')[0];
    dto.activo = documento.activo;
    dto.descargas_count = documento.descargasCount;
    dto.empresa_id = documento.empresaId;
    dto.subido_por =
      documento.subidoPor?.nombreCompleto || documento.subidoPor?.dni || null;
    dto.subido_por_id = documento.subidoPorId;
    dto.createdAt = documento.createdAt;
    dto.updatedAt = documento.updatedAt;
    return dto;
  }
}
