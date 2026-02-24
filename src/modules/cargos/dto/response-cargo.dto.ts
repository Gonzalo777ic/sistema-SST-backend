import { Cargo } from '../entities/cargo.entity';

export class ResponseCargoDto {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
  updated_at: string;

  static fromEntity(c: Cargo): ResponseCargoDto {
    const dto = new ResponseCargoDto();
    dto.id = c.id;
    dto.nombre = c.nombre;
    dto.activo = c.activo;
    dto.created_at = c.createdAt?.toISOString?.() || '';
    dto.updated_at = c.updatedAt?.toISOString?.() || '';
    return dto;
  }
}
