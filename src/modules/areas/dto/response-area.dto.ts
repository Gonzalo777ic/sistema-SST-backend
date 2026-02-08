export class ResponseAreaDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  empresa_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(area: {
    id: string;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    empresaId: string;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseAreaDto {
    const dto = new ResponseAreaDto();
    dto.id = area.id;
    dto.nombre = area.nombre;
    dto.descripcion = area.descripcion;
    dto.activo = area.activo;
    dto.empresa_id = area.empresaId;
    dto.createdAt = area.createdAt;
    dto.updatedAt = area.updatedAt;
    return dto;
  }
}
