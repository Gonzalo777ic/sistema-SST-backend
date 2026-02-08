import {
  TipoPeligro,
  Probabilidad,
  Consecuencia,
  NivelRiesgo,
  EstadoEvaluacionRiesgo,
} from '../entities/evaluacion-riesgo.entity';
import { JerarquiaControl, EstadoMedida } from '../entities/medida-control.entity';

export class MedidaControlResponseDto {
  id: string;
  jerarquia: JerarquiaControl;
  descripcion: string;
  responsable: string | null;
  responsable_id: string | null;
  fecha_implementacion: string | null;
  estado_medida: EstadoMedida;
}

export class ResponseEvaluacionRiesgoDto {
  id: string;
  actividad: string;
  peligro_identificado: string;
  tipo_peligro: TipoPeligro;
  fecha_evaluacion: string;
  probabilidad: Probabilidad;
  consecuencia: Consecuencia;
  nivel_riesgo: NivelRiesgo;
  controles_actuales: string | null;
  riesgo_residual: NivelRiesgo | null;
  estado: EstadoEvaluacionRiesgo;
  area_id: string | null;
  area_nombre: string | null;
  evaluador_id: string;
  evaluador_nombre: string | null;
  iperc_padre_id: string | null;
  empresa_id: string;
  medidas_control: MedidaControlResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(evaluacion: {
    id: string;
    actividad: string;
    peligroIdentificado: string;
    tipoPeligro: TipoPeligro;
    fechaEvaluacion: Date;
    probabilidad: Probabilidad;
    consecuencia: Consecuencia;
    nivelRiesgo: NivelRiesgo;
    controlesActuales: string | null;
    riesgoResidual: NivelRiesgo | null;
    estado: EstadoEvaluacionRiesgo;
    areaId: string | null;
    evaluadorId: string;
    ipercPadreId: string | null;
    empresaId: string;
    area?: { nombre: string } | null;
    evaluador?: { nombreCompleto?: string; dni?: string } | null;
    medidasControl?: Array<{
      id: string;
      jerarquia: JerarquiaControl;
      descripcion: string;
      responsable: string | null;
      responsableId: string | null;
      fechaImplementacion: Date | null;
      estadoMedida: EstadoMedida;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseEvaluacionRiesgoDto {
    const dto = new ResponseEvaluacionRiesgoDto();
    dto.id = evaluacion.id;
    dto.actividad = evaluacion.actividad;
    dto.peligro_identificado = evaluacion.peligroIdentificado;
    dto.tipo_peligro = evaluacion.tipoPeligro;
    fecha_evaluacion: evaluacion.fechaEvaluacion 
  ? (typeof evaluacion.fechaEvaluacion === 'string' 
      ? evaluacion.fechaEvaluacion 
      : evaluacion.fechaEvaluacion.toISOString().split('T')[0])
  : null,
    dto.probabilidad = evaluacion.probabilidad;
    dto.consecuencia = evaluacion.consecuencia;
    dto.nivel_riesgo = evaluacion.nivelRiesgo;
    dto.controles_actuales = evaluacion.controlesActuales;
    dto.riesgo_residual = evaluacion.riesgoResidual;
    dto.estado = evaluacion.estado;
    dto.area_id = evaluacion.areaId;
    dto.area_nombre = evaluacion.area?.nombre || null;
    dto.evaluador_id = evaluacion.evaluadorId;
    dto.evaluador_nombre =
      evaluacion.evaluador?.nombreCompleto || evaluacion.evaluador?.dni || null;
    dto.iperc_padre_id = evaluacion.ipercPadreId;
    dto.empresa_id = evaluacion.empresaId;
    dto.medidas_control =
      evaluacion.medidasControl?.map((m) => ({
        id: m.id,
        jerarquia: m.jerarquia,
        descripcion: m.descripcion,
        responsable: m.responsable,
        responsable_id: m.responsableId,
        fecha_implementacion: m.fechaImplementacion
          ? m.fechaImplementacion.toISOString().split('T')[0]
          : null,
        estado_medida: m.estadoMedida,
      })) || [];
    dto.createdAt = evaluacion.createdAt;
    dto.updatedAt = evaluacion.updatedAt;
    return dto;
  }
}
