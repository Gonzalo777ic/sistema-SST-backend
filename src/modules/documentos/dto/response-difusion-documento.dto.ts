import { EstadoDifusion } from '../entities/difusion-documento.entity';
import { DifusionDocumento } from '../entities/difusion-documento.entity';

export class ResponseDifusionDocumentoDto {
  id: string;
  documento_id: string;
  documento_nombre: string;
  fecha_difusion: string;
  requiere_firma: boolean;
  estado: EstadoDifusion;
  empresa_id: string;
  empresa_nombre: string;
  responsable_id: string;
  responsable_nombre: string;
  total_trabajadores: number;
  total_firmas: number;
  cumplimiento_porcentaje: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    difusion: DifusionDocumento & {
      documento?: { titulo: string };
      empresa?: { nombre: string };
      responsable?: { nombreCompleto?: string; dni?: string };
      totalTrabajadores?: number;
      totalFirmas?: number;
    },
  ): ResponseDifusionDocumentoDto {
    const dto = new ResponseDifusionDocumentoDto();
    dto.id = difusion.id;
    dto.documento_id = difusion.documentoId;
    dto.documento_nombre = difusion.documento?.titulo || 'N/A';
    dto.fecha_difusion = difusion.fechaDifusion.toISOString().split('T')[0];
    dto.requiere_firma = difusion.requiereFirma;
    dto.estado = difusion.estado;
    dto.empresa_id = difusion.empresaId;
    dto.empresa_nombre = difusion.empresa?.nombre || 'N/A';
    dto.responsable_id = difusion.responsableId;
    dto.responsable_nombre =
      difusion.responsable?.nombreCompleto || difusion.responsable?.dni || 'N/A';
    dto.total_trabajadores = difusion.totalTrabajadores || 0;
    dto.total_firmas = difusion.totalFirmas || 0;
    dto.cumplimiento_porcentaje =
      difusion.totalTrabajadores && difusion.totalTrabajadores > 0
        ? Math.round(
            ((difusion.totalFirmas || 0) / difusion.totalTrabajadores) * 100,
          )
        : 0;
    dto.createdAt = difusion.createdAt;
    dto.updatedAt = difusion.updatedAt;
    return dto;
  }
}
