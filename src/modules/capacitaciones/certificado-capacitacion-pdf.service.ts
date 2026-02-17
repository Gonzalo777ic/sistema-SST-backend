import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { StorageService } from '../../common/services/storage.service';
import { Capacitacion } from './entities/capacitacion.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ConfigCapacitacionesService } from '../config-capacitaciones/config-capacitaciones.service';
import { FirmasGerenteService } from '../empresas/firmas-gerente.service';

interface FirmaItem {
  nombre: string;
  cargo: string;
  firma_url: string | null;
  colegiatura?: string | null;
}

@Injectable()
export class CertificadoCapacitacionPdfService {
  constructor(
    private readonly storageService: StorageService,
    private readonly configCapacitacionesService: ConfigCapacitacionesService,
    private readonly firmasGerenteService: FirmasGerenteService,
  ) {}

  private async fetchImageBuffer(url: string | null | undefined): Promise<Buffer | null> {
    if (!url?.trim()) return null;
    try {
      if (url.startsWith('data:')) {
        const base64Match = url.match(/^data:image\/\w+;base64,(.+)$/);
        if (base64Match) return Buffer.from(base64Match[1], 'base64');
      }
      if (url.includes('storage.googleapis.com') && this.storageService.isAvailable()) {
        return await this.storageService.downloadFile(url);
      }
      if (url.includes('?')) {
        const res = await fetch(url);
        if (res.ok) return Buffer.from(await res.arrayBuffer());
      }
      return null;
    } catch {
      return null;
    }
  }

  private formatDuracion(duracionHoras: number | null, duracionMinutos: number | null): string {
    if (duracionMinutos != null) {
      const h = Math.floor(duracionMinutos / 60);
      const m = duracionMinutos % 60;
      if (h > 0 && m > 0) return `${h} hora${h > 1 ? 's' : ''} y ${m} minuto${m > 1 ? 's' : ''}`;
      if (h > 0) return `${h} hora${h > 1 ? 's' : ''}`;
      return `${m} minuto${m > 1 ? 's' : ''}`;
    }
    if (duracionHoras != null) {
      const h = Math.floor(Number(duracionHoras));
      const m = Math.round((Number(duracionHoras) - h) * 60);
      if (h > 0 && m > 0) return `${h} hora${h > 1 ? 's' : ''} y ${m} minuto${m > 1 ? 's' : ''}`;
      if (h > 0) return `${h} hora${h > 1 ? 's' : ''}`;
      return `${m} minuto${m > 1 ? 's' : ''}`;
    }
    return 'No especificada';
  }

  async generateCertificadoPdf(
    capacitacion: Capacitacion & { empresa?: Empresa | null },
    trabajador: Trabajador,
    nota: number,
    firmaCoordinadorUrl?: string | null,
    nombreCoordinador?: string | null,
    responsableRegistroNombre?: string | null,
    responsableRegistroFirmaUrl?: string | null,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const margin = 50;
    const contentWidth = doc.page.width - 2 * margin;

    const cap = capacitacion as any;
    const empresa = cap.empresa;
    const empresaId = empresa?.id ?? cap.empresaId;
    const titulo = cap.titulo || 'Capacitación';
    const descripcion = cap.descripcion || '';
    const fechaCap = cap.fecha ? new Date(cap.fecha) : new Date();
    const fechaStr = fechaCap.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const duracionStr = this.formatDuracion(
      cap.duracionHoras ?? null,
      cap.duracionMinutos ?? null,
    );
    const nombreCompleto = (trabajador.nombreCompleto || [trabajador.nombres, trabajador.apellidoPaterno, trabajador.apellidoMaterno].filter(Boolean).join(' ')).toUpperCase();
    const capacitadorNombre = nombreCoordinador || cap.instructorNombre || 'Capacitador';

    const responsableRrhhGerenteId = cap.responsableRrhhGerenteId ?? null;
    const responsableRegistroGerenteId = cap.responsableRegistroGerenteId ?? null;
    const responsableCertificacionGerenteId = cap.responsableCertificacionGerenteId ?? null;

    const [config, gerentes, gerenteRrhh, gerenteRegistro, gerenteCertificacion] = await Promise.all([
      this.configCapacitacionesService.getConfig(),
      empresaId ? this.firmasGerenteService.findForCertificado(empresaId) : Promise.resolve([]),
      responsableRrhhGerenteId ? this.firmasGerenteService.findByIdForCertificado(responsableRrhhGerenteId) : Promise.resolve(null),
      responsableRegistroGerenteId ? this.firmasGerenteService.findByIdForCertificado(responsableRegistroGerenteId) : Promise.resolve(null),
      responsableCertificacionGerenteId ? this.firmasGerenteService.findByIdForCertificado(responsableCertificacionGerenteId) : Promise.resolve(null),
    ]);

    // Siempre mostrar las 4 firmas cuando hay datos (requerido para validez legal ante auditorías)
    // Orden fijo 2x2: Capacitador, Gerente RRHH, Responsable Registro, Responsable Certificación
    const firmas2x2: (FirmaItem | null)[] = [null, null, null, null];

    // Roles fijos para el documento (no usar cargo de BD)
    const ROL_CAPACITADOR = 'CAPACITADOR';
    const ROL_GERENTE_RRHH = 'GERENTE DE RRHH';
    const ROL_RESP_REGISTRO = 'RESPONSABLE DE REGISTRO';
    const ROL_RESP_CERTIFICACION = 'RESPONSABLE DE CERTIFICACIÓN';

    firmas2x2[0] = { nombre: capacitadorNombre, cargo: ROL_CAPACITADOR, firma_url: firmaCoordinadorUrl ?? null };

    const gRrhh = gerenteRrhh ?? gerentes.find((x) => x.rol === 'RRHH');
    if (gRrhh) firmas2x2[1] = { nombre: gRrhh.nombre_completo, cargo: ROL_GERENTE_RRHH, firma_url: gRrhh.firma_url };

    const gRegistro = gerenteRegistro ?? gerentes.find((x) => x.rol === 'SST');
    if (gRegistro) {
      firmas2x2[2] = { nombre: gRegistro.nombre_completo, cargo: ROL_RESP_REGISTRO, firma_url: gRegistro.firma_url };
    } else if (responsableRegistroNombre) {
      firmas2x2[2] = { nombre: responsableRegistroNombre, cargo: ROL_RESP_REGISTRO, firma_url: responsableRegistroFirmaUrl ?? null };
    }

    const gCert = gerenteCertificacion ?? gerentes.find((x) => x.rol === 'CERTIFICACION');
    if (gCert) {
      firmas2x2[3] = { nombre: gCert.nombre_completo, cargo: ROL_RESP_CERTIFICACION, firma_url: gCert.firma_url };
    } else if (config.responsables_certificacion?.length) {
      const r = config.responsables_certificacion[0];
      firmas2x2[3] = { nombre: r.nombre_completo, cargo: ROL_RESP_CERTIFICACION, firma_url: null };
    }

    const firmasParaEstampar = firmas2x2.filter((f): f is FirmaItem => f !== null);

    // 1. Encabezado: Logo centrado
    let logoY = 50;
    if (empresa?.logoUrl) {
      const logoBuf = await this.fetchImageBuffer(empresa.logoUrl);
      if (logoBuf) {
        try {
          const logoW = 80;
          const logoH = 50;
          doc.image(logoBuf, doc.page.width / 2 - logoW / 2, logoY, { fit: [logoW, logoH] });
          logoY += logoH + 8;
        } catch {
          logoY += 5;
        }
      }
    }

    // 2. Título principal: CERTIFICADO (24-28pt) - centrado
    doc.fontSize(26).font('Helvetica-Bold').text('CERTIFICADO', margin, logoY, { align: 'center', width: contentWidth });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('Seguridad y Salud en el Trabajo', margin, doc.y, { align: 'center', width: contentWidth });
    doc.moveDown(2);

    // 3. Cuerpo: Nombre participante en mayúsculas, negrita, destacado
    doc.fontSize(18).font('Helvetica-Bold').text(nombreCompleto, margin, doc.y, { align: 'center', width: contentWidth });
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica').text(`Por haber aprobado la capacitación (nota ${nota.toFixed(1)})`, margin, doc.y, { align: 'center', width: contentWidth });
    doc.moveDown(0.5);

    // Detalle del tema: título + descripción/temas (desde datos generales de la capacitación)
    const temaCompleto = descripcion ? `${titulo} * ${descripcion}` : titulo;
    doc.fontSize(11).font('Helvetica').text(temaCompleto, margin, doc.y, { align: 'center', width: contentWidth });
    doc.moveDown(1);

    // Datos de sesión
    doc.fontSize(11).font('Helvetica');
    doc.text(`Duración: ${duracionStr}`, margin, doc.y, { align: 'center', width: contentWidth });
    doc.moveDown(0.3);
    doc.text(`Fecha: ${fechaStr}`, margin, doc.y, { align: 'center', width: contentWidth });
    doc.moveDown(2);

    // 4. Bloque de validación: grid 2x2 con línea para firma, nombre y cargo
    if (firmasParaEstampar.length > 0) {
      await this.renderFirmas2x2(doc, firmasParaEstampar);
    } else {
      doc.fontSize(10).font('Helvetica').text(capacitadorNombre, { align: 'center' });
      doc.moveDown(2);
    }

    if (empresa?.nombre) {
      doc.fontSize(9).text(empresa.nombre, margin, doc.y, { align: 'center', width: contentWidth });
    }

    doc.end();
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private async renderFirmas(doc: PDFKit.PDFDocument, firmas: FirmaItem[]): Promise<void> {
    await this.renderFirmas2x2(doc, firmas);
  }

  /** Grid 2x2: imagen de firma, línea debajo de la firma, nombre y rol */
  private async renderFirmas2x2(doc: PDFKit.PDFDocument, firmas: FirmaItem[]): Promise<void> {
    const margin = 50;
    const pageWidth = doc.page.width - 2 * margin;
    const cellWidth = pageWidth / 2;
    const cellHeight = 85;
    const lineW = 110;
    const imgW = 85;
    const imgH = 42;
    const baseY = doc.y;

    for (let i = 0; i < Math.min(firmas.length, 4); i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cellX = margin + col * cellWidth;
      const centerX = cellX + (cellWidth - lineW) / 2;
      const cellTopY = baseY + row * cellHeight;

      const f = firmas[i];

      // 1. Imagen de firma primero (arriba)
      let contentY = cellTopY;
      if (f.firma_url) {
        const firmaBuf = await this.fetchImageBuffer(f.firma_url);
        if (firmaBuf) {
          try {
            const imgCenterX = cellX + (cellWidth - imgW) / 2;
            doc.image(firmaBuf, imgCenterX, contentY, { width: imgW, height: imgH });
            contentY += imgH + 4;
          } catch {
            contentY += 10;
          }
        } else {
          contentY += 10;
        }
      } else {
        contentY += 10;
      }

      // 2. Línea horizontal debajo de la firma
      doc.moveTo(centerX, contentY).lineTo(centerX + lineW, contentY).stroke();
      contentY += 8;

      // 3. Nombre completo
      doc.fontSize(9).font('Helvetica').text(f.nombre, cellX, contentY, { width: cellWidth, align: 'center' });
      contentY += 12;

      // 4. Rol (CAPACITADOR, GERENTE DE RRHH, etc.)
      doc.fontSize(8).text(f.cargo, cellX, contentY, { width: cellWidth, align: 'center' });
      if (f.colegiatura) {
        doc.fontSize(7).text(f.colegiatura, cellX, contentY + 12, { width: cellWidth, align: 'center' });
      }
    }

    const rows = Math.ceil(Math.min(firmas.length, 4) / 2);
    doc.y = baseY + rows * cellHeight + 15;
  }
}
