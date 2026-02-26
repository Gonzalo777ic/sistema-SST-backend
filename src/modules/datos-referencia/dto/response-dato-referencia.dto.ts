import { DatoReferencia } from '../entities/dato-referencia.entity';

export class ResponseDatoReferenciaDto {
  id: string;
  tipo: string;
  valor: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;

  static fromEntity(d: DatoReferencia): ResponseDatoReferenciaDto {
    const dto = new ResponseDatoReferenciaDto();
    dto.id = d.id;
    dto.tipo = d.tipo;
    dto.valor = d.valor;
    dto.orden = d.orden ?? 0;
    dto.activo = d.activo;
    dto.created_at = d.createdAt?.toISOString?.() || '';
    dto.updated_at = d.updatedAt?.toISOString?.() || '';
    return dto;
  }
}
