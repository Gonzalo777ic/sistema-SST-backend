import { TipoInspeccion, EstadoInspeccion } from '../entities/inspeccion.entity';
import { CriticidadHallazgo, EstadoHallazgo } from '../entities/hallazgo-inspeccion.entity';

export class HallazgoResponseDto {
  id: string;
  descripcion: string;
  criticidad: CriticidadHallazgo;
  foto_url: string | null;
  accion_correctiva: string;
  responsable_id: string;
  responsable_nombre: string | null;
  fecha_limite: string;
  estado_hallazgo: EstadoHallazgo;
}

export class ResponseInspeccionDto {
  id: string;
  tipo_inspeccion: TipoInspeccion;
  fecha_inspeccion: string;
  puntuacion: number;
  observaciones: string | null;
  fotos_generales: string[] | null;
  estado: EstadoInspeccion;
  inspector_id: string;
  inspector_nombre: string | null;
  area_id: string | null;
  area_nombre: string | null;
  empresa_id: string;
  hallazgos: HallazgoResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(inspeccion: {
    id: string;
    tipoInspeccion: TipoInspeccion;
    fechaInspeccion: Date;
    puntuacion: number;
    observaciones: string | null;
    fotosGenerales: string[] | null;
    estado: EstadoInspeccion;
    inspectorId: string;
    areaId: string | null;
    empresaId: string;
    inspector?: { nombreCompleto?: string; dni?: string } | null;
    area?: { nombre: string } | null;
    hallazgos?: Array<{
      id: string;
      descripcion: string;
      criticidad: CriticidadHallazgo;
      fotoUrl: string | null;
      accionCorrectiva: string;
      responsableId: string;
      fechaLimite: Date;
      estadoHallazgo: EstadoHallazgo;
      responsable?: { nombreCompleto: string } | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseInspeccionDto {
    const dto = new ResponseInspeccionDto();
    dto.id = inspeccion.id;
    dto.tipo_inspeccion = inspeccion.tipoInspeccion;
    dto.fecha_inspeccion = inspeccion.fechaInspeccion.toISOString().split('T')[0];
    dto.puntuacion = Number(inspeccion.puntuacion);
    dto.observaciones = inspeccion.observaciones;
    dto.fotos_generales = inspeccion.fotosGenerales;
    dto.estado = inspeccion.estado;
    dto.inspector_id = inspeccion.inspectorId;
    dto.inspector_nombre =
      inspeccion.inspector?.nombreCompleto || inspeccion.inspector?.dni || null;
    dto.area_id = inspeccion.areaId;
    dto.area_nombre = inspeccion.area?.nombre || null;
    dto.empresa_id = inspeccion.empresaId;
    dto.hallazgos =
      inspeccion.hallazgos?.map((h) => ({
        id: h.id,
        descripcion: h.descripcion,
        criticidad: h.criticidad,
        foto_url: h.fotoUrl,
        accion_correctiva: h.accionCorrectiva,
        responsable_id: h.responsableId,
        responsable_nombre: h.responsable?.nombreCompleto || null,
        fecha_limite: h.fechaLimite.toISOString().split('T')[0],
        estado_hallazgo: h.estadoHallazgo,
      })) || [];
    dto.createdAt = inspeccion.createdAt;
    dto.updatedAt = inspeccion.updatedAt;
    return dto;
  }
}
