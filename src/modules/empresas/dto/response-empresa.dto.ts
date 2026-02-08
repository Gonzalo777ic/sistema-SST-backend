export class ResponseEmpresaDto {
  id: string;
  nombre: string;
  ruc: string;
  logoUrl: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(empresa: {
    id: string;
    nombre: string;
    ruc: string;
    logoUrl: string | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseEmpresaDto {
    const dto = new ResponseEmpresaDto();
    dto.id = empresa.id;
    dto.nombre = empresa.nombre;
    dto.ruc = empresa.ruc;
    dto.logoUrl = empresa.logoUrl;
    dto.activo = empresa.activo;
    dto.createdAt = empresa.createdAt;
    dto.updatedAt = empresa.updatedAt;
    return dto;
  }
}
