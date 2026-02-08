import { EstadoContratista } from '../entities/contratista.entity';
import {
  TipoDocumentoContratista,
  EstadoDocumento,
} from '../entities/documento-contratista.entity';

export class DocumentoContratistaResponseDto {
  id: string;
  tipo_documento: TipoDocumentoContratista;
  archivo_url: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado_doc: EstadoDocumento;
}

export class ResponseContratistaDto {
  id: string;
  ruc: string;
  razon_social: string;
  tipo_servicio: string;
  representante_legal: string;
  contacto_principal: string;
  telefono: string;
  email: string;
  estado: EstadoContratista;
  evaluacion_desempeno: number | null;
  observaciones: string | null;
  supervisor_asignado_id: string | null;
  supervisor_asignado_nombre: string | null;
  empresa_id: string;
  documentos: DocumentoContratistaResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(contratista: {
    id: string;
    ruc: string;
    razonSocial: string;
    tipoServicio: string;
    representanteLegal: string;
    contactoPrincipal: string;
    telefono: string;
    email: string;
    estado: EstadoContratista;
    evaluacionDesempeno: number | null;
    observaciones: string | null;
    supervisorAsignadoId: string | null;
    empresaId: string;
    supervisorAsignado?: { nombreCompleto?: string; email?: string } | null;
    documentos?: Array<{
      id: string;
      tipoDocumento: TipoDocumentoContratista;
      archivoUrl: string;
      fechaEmision: Date;
      fechaVencimiento: Date;
      estadoDoc: EstadoDocumento;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseContratistaDto {
    const dto = new ResponseContratistaDto();
    dto.id = contratista.id;
    dto.ruc = contratista.ruc;
    dto.razon_social = contratista.razonSocial;
    dto.tipo_servicio = contratista.tipoServicio;
    dto.representante_legal = contratista.representanteLegal;
    dto.contacto_principal = contratista.contactoPrincipal;
    dto.telefono = contratista.telefono;
    dto.email = contratista.email;
    dto.estado = contratista.estado;
    dto.evaluacion_desempeno = contratista.evaluacionDesempeno;
    dto.observaciones = contratista.observaciones;
    dto.supervisor_asignado_id = contratista.supervisorAsignadoId;
    dto.supervisor_asignado_nombre =
      contratista.supervisorAsignado?.nombreCompleto ||
      contratista.supervisorAsignado?.email ||
      null;
    dto.empresa_id = contratista.empresaId;
    dto.documentos =
      contratista.documentos?.map((doc) => ({
        id: doc.id,
        tipo_documento: doc.tipoDocumento,
        archivo_url: doc.archivoUrl,
        fecha_emision: doc.fechaEmision.toISOString().split('T')[0],
        fecha_vencimiento: doc.fechaVencimiento.toISOString().split('T')[0],
        estado_doc: doc.estadoDoc,
      })) || [];
    dto.createdAt = contratista.createdAt;
    dto.updatedAt = contratista.updatedAt;
    return dto;
  }
}
