import { EstadoPETS } from '../entities/pets.entity';

export class PasoResponseDto {
  numero: number;
  descripcion: string;
  peligros: string | null;
  medidas_control: string | null;
  epp_requerido: string[] | null;
}

export class LecturaResponseDto {
  usuario_id: string;
  usuario_nombre: string;
  fecha_lectura: string;
  aceptado: boolean;
}

export class ResponsePetsDto {
  id: string;
  codigo: string;
  titulo: string;
  version: number;
  estado: EstadoPETS;
  objetivo: string;
  alcance: string;
  definiciones: string | null;
  area_proceso: string | null;
  referencias_normativas: string[] | null;
  equipos_materiales: any[] | null;
  requisitos_previos: any | null;
  fecha_emision: string;
  fecha_revision: string | null;
  elaborador_id: string;
  elaborador_nombre: string | null;
  revisor_id: string | null;
  revisor_nombre: string | null;
  aprobador_id: string | null;
  aprobador_nombre: string | null;
  empresa_id: string;
  pasos: PasoResponseDto[];
  lecturas: LecturaResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(pets: {
    id: string;
    codigo: string;
    titulo: string;
    version: number;
    estado: EstadoPETS;
    objetivo: string;
    alcance: string;
    definiciones: string | null;
    areaProceso: string | null;
    referenciasNormativas: string[] | null;
    equiposMateriales: any[] | null;
    requisitosPrevios: any | null;
    fechaEmision: Date;
    fechaRevision: Date | null;
    elaboradorId: string;
    revisorId: string | null;
    aprobadorId: string | null;
    empresaId: string;
    elaborador?: { nombreCompleto?: string; email?: string } | null;
    revisor?: { nombreCompleto?: string; email?: string } | null;
    aprobador?: { nombreCompleto?: string; email?: string } | null;
    pasos?: Array<{
      numero: number;
      descripcion: string;
      peligros: string | null;
      medidasControl: string | null;
      eppRequerido: string[] | null;
    }>;
    lecturas?: Array<{
      usuarioId: string;
      usuarioNombre: string;
      fechaLectura: Date;
      aceptado: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponsePetsDto {
    const dto = new ResponsePetsDto();
    dto.id = pets.id;
    dto.codigo = pets.codigo;
    dto.titulo = pets.titulo;
    dto.version = pets.version;
    dto.estado = pets.estado;
    dto.objetivo = pets.objetivo;
    dto.alcance = pets.alcance;
    dto.definiciones = pets.definiciones;
    dto.area_proceso = pets.areaProceso;
    dto.referencias_normativas = pets.referenciasNormativas;
    dto.equipos_materiales = pets.equiposMateriales;
    dto.requisitos_previos = pets.requisitosPrevios;
    dto.fecha_emision = pets.fechaEmision.toISOString().split('T')[0];
    dto.fecha_revision = pets.fechaRevision
      ? pets.fechaRevision.toISOString().split('T')[0]
      : null;
    dto.elaborador_id = pets.elaboradorId;
    dto.elaborador_nombre =
      pets.elaborador?.nombreCompleto || pets.elaborador?.email || null;
    dto.revisor_id = pets.revisorId;
    dto.revisor_nombre =
      pets.revisor?.nombreCompleto || pets.revisor?.email || null;
    dto.aprobador_id = pets.aprobadorId;
    dto.aprobador_nombre =
      pets.aprobador?.nombreCompleto || pets.aprobador?.email || null;
    dto.empresa_id = pets.empresaId;
    dto.pasos =
      pets.pasos?.map((p) => ({
        numero: p.numero,
        descripcion: p.descripcion,
        peligros: p.peligros,
        medidas_control: p.medidasControl,
        epp_requerido: p.eppRequerido,
      })) || [];
    dto.lecturas =
      pets.lecturas?.map((l) => ({
        usuario_id: l.usuarioId,
        usuario_nombre: l.usuarioNombre,
        fecha_lectura: l.fechaLectura.toISOString(),
        aceptado: l.aceptado,
      })) || [];
    dto.createdAt = pets.createdAt;
    dto.updatedAt = pets.updatedAt;
    return dto;
  }
}
