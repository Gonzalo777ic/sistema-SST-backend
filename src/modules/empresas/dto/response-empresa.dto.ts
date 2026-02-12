export class ResponseEmpresaDto {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string | null;
  actividad_economica: string | null;
  logoUrl: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(empresa: {
    id: string;
    nombre: string;
    ruc: string;
    direccion?: string | null;
    actividadEconomica?: string | null;
    logoUrl: string | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseEmpresaDto {
    const dto = new ResponseEmpresaDto();
    dto.id = empresa.id;
    dto.nombre = empresa.nombre;
    dto.ruc = empresa.ruc;
    dto.direccion = (empresa as any).direccion ?? null;
    dto.actividad_economica = (empresa as any).actividadEconomica ?? null;
    dto.logoUrl = empresa.logoUrl;
    dto.activo = empresa.activo;
    dto.createdAt = empresa.createdAt;
    dto.updatedAt = empresa.updatedAt;
    return dto;
  }
}
