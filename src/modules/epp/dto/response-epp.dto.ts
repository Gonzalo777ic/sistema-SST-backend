import { TipoProteccionEPP, CategoriaEPP, VigenciaEPP } from '../entities/epp.entity';

export class ResponseEppDto {
  id: string;
  nombre: string;
  tipo_proteccion: TipoProteccionEPP;
  categoria: CategoriaEPP;
  descripcion: string | null;
  imagen_url: string | null;
  vigencia: VigenciaEPP | null;
  adjunto_pdf_url: string | null;
  stock: number;
  empresa_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(epp: any): ResponseEppDto {
    const dto = new ResponseEppDto();
    dto.id = epp.id;
    dto.nombre = epp.nombre;
    dto.tipo_proteccion = epp.tipoProteccion;
    dto.categoria = epp.categoria;
    dto.descripcion = epp.descripcion;
    dto.imagen_url = epp.imagenUrl;
    dto.vigencia = epp.vigencia;
    dto.adjunto_pdf_url = epp.adjuntoPdfUrl;
    dto.stock = epp.stock;
    dto.empresa_id = epp.empresaId;
    dto.createdAt = epp.createdAt;
    dto.updatedAt = epp.updatedAt;
    return dto;
  }
}
