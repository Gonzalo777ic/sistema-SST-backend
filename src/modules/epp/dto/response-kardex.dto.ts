import { ResponseSolicitudEppDto } from './response-solicitud-epp.dto';

export class ResponseKardexDto {
  trabajador_id: string;
  trabajador_nombre: string;
  trabajador_documento: string;
  historial: ResponseSolicitudEppDto[];

  static fromEntity(data: {
    trabajador: any;
    solicitudes: any[];
  }): ResponseKardexDto {
    const dto = new ResponseKardexDto();
    dto.trabajador_id = data.trabajador.id;
    dto.trabajador_nombre = data.trabajador.nombreCompleto;
    dto.trabajador_documento = data.trabajador.documentoIdentidad;
    dto.historial = data.solicitudes.map((s) => ResponseSolicitudEppDto.fromEntity(s));
    return dto;
  }
}
