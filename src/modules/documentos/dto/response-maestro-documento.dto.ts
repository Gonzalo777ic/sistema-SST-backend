export class ResponseMaestroDocumentoDto {
  id: string;
  nombre: string;
  proceso: string;
  subproceso: string;
  empresa_id: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: {
    id: string;
    nombre: string;
    proceso: string;
    subproceso: string;
    empresaId: string;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseMaestroDocumentoDto {
    const dto = new ResponseMaestroDocumentoDto();
    dto.id = entity.id;
    dto.nombre = entity.nombre;
    dto.proceso = entity.proceso;
    dto.subproceso = entity.subproceso;
    dto.empresa_id = entity.empresaId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
