import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { SolicitudEPP } from './entities/solicitud-epp.entity';
import { CategoriaEPP } from './entities/epp.entity';
import { StorageService } from '../../common/services/storage.service';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'registros-epp');
const KARDEX_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'kardex-epp');

export interface PdfResult {
  buffer: Buffer;
  hashAuditoria: string;
}

@Injectable()
export class EppPdfService {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Obtiene el buffer de una imagen desde URL (data:, GCS o http).
   */
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
      const res = await fetch(url);
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    } catch {
      return null;
    }
  }
  private ensureUploadDir(): string {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    return UPLOAD_DIR;
  }

  /**
   * Hash de auditoría: últimos 7 caracteres alfanuméricos del UUID (sin guiones).
   */
  static getHashAuditoria(solicitudId: string): string {
    return solicitudId.replace(/-/g, '').slice(-7);
  }

  /**
   * Genera el PDF de registro de entrega en memoria (buffer).
   * Incluye hash de auditoría junto a fecha y hora de entrega.
   * Embeber imágenes de firma: trabajador (transacción o maestra) y responsable (maestra).
   */
  async generateRegistroEntregaPdf(solicitud: SolicitudEPP): Promise<PdfResult> {
    const detalles = (solicitud.detalles || []).filter((d) => !d.exceptuado);
    if (detalles.length === 0) {
      throw new Error('No hay items entregados para generar el registro');
    }

    const empresa = solicitud.empresa as any;
    const solicitante = solicitud.solicitante as any;
    const entregadoPor = solicitud.entregadoPor as any;

    // Priorizar firma de transacción (capturada en entrega) sobre firma maestra (onboarding)
    const firmaTrabajadorUrl = solicitud.firmaRecepcionUrl ?? solicitante?.firmaDigitalUrl ?? null;
    const firmaResponsableUrl = entregadoPor?.firmaUrl ?? null;

    const [firmaTrabajadorBuf, firmaResponsableBuf] = await Promise.all([
      this.fetchImageBuffer(firmaTrabajadorUrl),
      this.fetchImageBuffer(firmaResponsableUrl),
    ]);

    const responsableNombre =
      entregadoPor?.trabajador?.nombreCompleto ||
      [entregadoPor?.nombres, entregadoPor?.apellidoPaterno, entregadoPor?.apellidoMaterno]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      entregadoPor?.dni ||
      'Sin asignar';

    const areaNombre = (solicitante?.area as any)?.nombre || solicitante?.area?.nombre || '-';
    const fechaEntrega = solicitud.fechaEntrega ? new Date(solicitud.fechaEntrega) : new Date();
    const hashAuditoria = EppPdfService.getHashAuditoria(solicitud.id);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve({ buffer: Buffer.concat(chunks), hashAuditoria });
      });
      doc.on('error', reject);

      doc.fontSize(10).text('', 40, 40);

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(
        'REGISTRO DE ENTREGA DE EQUIPO DE PROTECCIÓN PERSONAL Y UNIFORME',
        200,
        40,
        { width: 350, align: 'right' }
      );
      doc.font('Helvetica');

      let y = 90;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('RAZÓN SOCIAL O DENOMINACIÓN SOCIAL:', 40, y);
      doc.font('Helvetica');
      doc.text(empresa?.nombre || '-', 40, y + 14, { width: 250 });
      doc.font('Helvetica-Bold');
      doc.text('RUC:', 300, y);
      doc.font('Helvetica');
      doc.text(empresa?.ruc || '-', 300, y + 14);
      y += 36;

      doc.font('Helvetica-Bold');
      doc.text('DIRECCIÓN:', 40, y);
      doc.font('Helvetica');
      doc.text(empresa?.direccion || '-', 40, y + 14, { width: 250 });
      doc.font('Helvetica-Bold');
      doc.text('ACTIVIDAD ECONÓMICA:', 300, y);
      doc.font('Helvetica');
      doc.text((empresa?.actividadEconomica || '-').substring(0, 40), 300, y + 14, { width: 230 });
      y += 36;

      doc.font('Helvetica-Bold');
      doc.text('N° TRABAJADORES:', 40, y);
      doc.font('Helvetica');
      doc.text(String(empresa?.numeroTrabajadores ?? '-'), 150, y);
      y += 30;

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('RESPONSABLE DE ENTREGA:', 40, y);
      doc.font('Helvetica');
      doc.text(responsableNombre, 40, y + 14);
      y += 36;

      doc.font('Helvetica-Bold');
      doc.text('APELLIDOS Y NOMBRES:', 40, y);
      doc.font('Helvetica');
      doc.text(solicitante?.nombreCompleto || '-', 40, y + 14);
      doc.font('Helvetica-Bold');
      doc.text('DNI:', 300, y);
      doc.font('Helvetica');
      doc.text(solicitante?.documentoIdentidad || '-', 300, y + 14);
      y += 36;

      const tableTop = y + 10;
      const colWidths = {
        desc: 140,
        cant: 35,
        fecha: 55,
        area: 60,
        epp: 35,
        uni: 40,
        firmaTrab: 90,
        firmaResp: 90,
      };

      doc.font('Helvetica-Bold').fontSize(8);
      doc.fillColor('#e5e7eb').rect(40, tableTop, 516, 20).fill();
      doc.strokeColor('#374151').rect(40, tableTop, 516, 20).stroke();
      doc.fillColor('#111827');
      doc.text('DESCRIPCIÓN', 45, tableTop + 6, { width: colWidths.desc - 10 });
      doc.text('CANT.', 185, tableTop + 6, { width: colWidths.cant - 5 });
      doc.text('FECHA ENTREGA', 220, tableTop + 6, { width: colWidths.fecha - 5 });
      doc.text('ÁREA', 275, tableTop + 6, { width: colWidths.area - 5 });
      doc.text('EPP', 335, tableTop + 6, { width: colWidths.epp - 5 });
      doc.text('UNIF.', 370, tableTop + 6, { width: colWidths.uni - 5 });
      doc.text('FIRMA TRABAJADOR', 410, tableTop + 6, { width: colWidths.firmaTrab - 5 });
      doc.text('FIRMA RESPONSABLE', 500, tableTop + 6, { width: colWidths.firmaResp - 5 });
      doc.font('Helvetica').fillColor('#000000');

      let rowY = tableTop + 28;
      const rowHeight = 50;
      const fechaStr = fechaEntrega.toLocaleDateString('es-PE');
      const fechaHoraStr = fechaEntrega.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      doc.fontSize(8).fillColor('#6b7280');
      doc.text(
        `Registro de auditoría: ${fechaHoraStr} - Hash: ${hashAuditoria}`,
        40,
        tableTop - 8,
      );
      doc.fillColor('#000000');

      for (const det of detalles) {
        const epp = det.epp as any;
        const desc = `${epp?.nombre || '-'}${epp?.descripcion ? `, ${epp.descripcion}` : ''}`.substring(0, 45);
        const esEpp = epp?.categoria === CategoriaEPP.EPP;
        const horaStr = det.fechaHoraEntrega
          ? new Date(det.fechaHoraEntrega).toLocaleString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : fechaStr;

        doc.rect(40, rowY, 516, rowHeight).stroke();
        doc.fontSize(8);
        doc.text(desc, 45, rowY + 4, { width: colWidths.desc - 10 });
        doc.text(String(det.cantidad), 185, rowY + 4);
        doc.text(fechaStr, 220, rowY + 4);
        doc.text(areaNombre, 275, rowY + 4, { width: colWidths.area - 5 });
        doc.text(esEpp ? 'X' : '', 335, rowY + 4);
        doc.text(!esEpp ? 'X' : '', 370, rowY + 4);

        const imgW = 80;
        const imgH = 40;
        const centerTrab = 410 + (colWidths.firmaTrab - imgW) / 2;
        const centerResp = 500 + (colWidths.firmaResp - imgW) / 2;
        if (firmaTrabajadorBuf) {
          try {
            doc.image(firmaTrabajadorBuf, centerTrab, rowY + 4, { width: imgW, height: imgH });
          } catch {
            doc.fontSize(7).fillColor('#6b7280').text('-', 410, rowY + 20);
          }
        } else {
          doc.fontSize(7).fillColor('#6b7280').text('-', 410, rowY + 20);
        }
        if (firmaResponsableBuf) {
          try {
            doc.image(firmaResponsableBuf, centerResp, rowY + 4, { width: imgW, height: imgH });
          } catch {
            doc.fontSize(7).fillColor('#6b7280').text('-', 500, rowY + 20);
          }
        } else {
          doc.fontSize(7).fillColor('#6b7280').text('-', 500, rowY + 20);
        }
        doc.fontSize(7).fillColor('#6b7280');
        doc.text(`${horaStr} - ${hashAuditoria}`, 40, rowY + rowHeight - 12, { width: 350 });
        doc.fillColor('#000000');
        rowY += rowHeight;
      }

      doc.end();
    });
  }

  /**
   * Genera el PDF de kardex consolidado del trabajador con TODOS los items de TODAS las entregas.
   * Se invoca cada vez que se marca una solicitud como ENTREGADA.
   */
  async generateKardexPdfPorTrabajador(
    trabajador: any,
    solicitudesEntregadas: SolicitudEPP[],
  ): Promise<Buffer> {
    const items: Array<{
      desc: string;
      cant: number;
      fechaStr: string;
      areaNombre: string;
      esEpp: boolean;
      firmaTrabajadorUrl: string | null;
      firmaResponsableUrl: string | null;
      horaStr: string;
      hashAuditoria: string;
    }> = [];

    for (const sol of solicitudesEntregadas) {
      const empresa = sol.empresa as any;
      const solicitante = sol.solicitante as any;
      const entregadoPor = sol.entregadoPor as any;
      const areaNombre = (solicitante?.area as any)?.nombre || solicitante?.area?.nombre || '-';
      const hashAuditoria = EppPdfService.getHashAuditoria(sol.id);
      const firmaResponsableUrl = entregadoPor?.firmaUrl ?? null;

      for (const det of sol.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        const desc = `${epp?.nombre || '-'}${epp?.descripcion ? `, ${epp.descripcion}` : ''}`.substring(0, 45);
        const esEpp = epp?.categoria === CategoriaEPP.EPP;
        const fechaEntrega = sol.fechaEntrega ? new Date(sol.fechaEntrega) : new Date();
        const fechaStr = fechaEntrega.toLocaleDateString('es-PE');
        const horaStr = det.fechaHoraEntrega
          ? new Date(det.fechaHoraEntrega).toLocaleString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : fechaStr;
        const firmaTrabajadorUrl = det.firmaTrabajadorUrl ?? sol.firmaRecepcionUrl ?? solicitante?.firmaDigitalUrl ?? null;

        items.push({
          desc,
          cant: det.cantidad,
          fechaStr,
          areaNombre,
          esEpp,
          firmaTrabajadorUrl,
          firmaResponsableUrl,
          horaStr,
          hashAuditoria,
        });
      }
    }

    if (items.length === 0) {
      throw new Error('No hay items entregados para generar el kardex');
    }

    const empresa = solicitudesEntregadas[0]?.empresa as any;
    const solicitante = trabajador;
    const entregadoPor = solicitudesEntregadas[0]?.entregadoPor as any;
    const responsableNombre =
      entregadoPor?.trabajador?.nombreCompleto ||
      [entregadoPor?.nombres, entregadoPor?.apellidoPaterno, entregadoPor?.apellidoMaterno]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      entregadoPor?.dni ||
      'Sin asignar';

    const firmasCache = new Map<string, Buffer | null>();
    const fetchFirma = async (url: string | null): Promise<Buffer | null> => {
      if (!url?.trim()) return null;
      const key = url.substring(0, 120);
      if (firmasCache.has(key)) return firmasCache.get(key)!;
      const buf = await this.fetchImageBuffer(url);
      firmasCache.set(key, buf);
      return buf;
    };

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    return new Promise(async (resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('KARDEX DE EPP - REGISTRO HISTÓRICO DE ENTREGAS', 40, 40, { width: 500 });
      doc.font('Helvetica').fontSize(10);

      let y = 75;
      doc.font('Helvetica-Bold');
      doc.text('RAZÓN SOCIAL:', 40, y);
      doc.font('Helvetica');
      doc.text(empresa?.nombre || '-', 40, y + 14, { width: 250 });
      doc.text('RUC:', 300, y);
      doc.text(empresa?.ruc || '-', 300, y + 14);
      y += 36;

      doc.font('Helvetica-Bold');
      doc.text('TRABAJADOR:', 40, y);
      doc.font('Helvetica');
      doc.text(solicitante?.nombreCompleto || '-', 40, y + 14);
      doc.text('DNI:', 300, y);
      doc.text(solicitante?.documentoIdentidad || '-', 300, y + 14);
      y += 36;

      doc.font('Helvetica-Bold');
      doc.text('RESPONSABLE DE ENTREGA:', 40, y);
      doc.font('Helvetica');
      doc.text(responsableNombre, 40, y + 14);
      y += 40;

      const tableTop = y + 10;
      const colWidths = { desc: 140, cant: 35, fecha: 55, area: 60, epp: 35, uni: 40, firmaTrab: 90, firmaResp: 90 };
      const rowHeight = 50;

      doc.font('Helvetica-Bold').fontSize(8);
      doc.fillColor('#e5e7eb').rect(40, tableTop, 516, 20).fill();
      doc.strokeColor('#374151').rect(40, tableTop, 516, 20).stroke();
      doc.fillColor('#111827');
      doc.text('DESCRIPCIÓN', 45, tableTop + 6, { width: colWidths.desc - 10 });
      doc.text('CANT.', 185, tableTop + 6);
      doc.text('FECHA ENTREGA', 220, tableTop + 6);
      doc.text('ÁREA', 275, tableTop + 6);
      doc.text('EPP', 335, tableTop + 6);
      doc.text('UNIF.', 370, tableTop + 6);
      doc.text('FIRMA TRABAJADOR', 410, tableTop + 6);
      doc.text('FIRMA RESPONSABLE', 500, tableTop + 6);
      doc.font('Helvetica').fillColor('#000000');

      let rowY = tableTop + 28;
      const imgW = 80;
      const imgH = 40;

      for (const it of items) {
        const [firmaTrabBuf, firmaRespBuf] = await Promise.all([
          fetchFirma(it.firmaTrabajadorUrl),
          fetchFirma(it.firmaResponsableUrl),
        ]);

        doc.rect(40, rowY, 516, rowHeight).stroke();
        doc.fontSize(8);
        doc.text(it.desc, 45, rowY + 4, { width: colWidths.desc - 10 });
        doc.text(String(it.cant), 185, rowY + 4);
        doc.text(it.fechaStr, 220, rowY + 4);
        doc.text(it.areaNombre, 275, rowY + 4, { width: colWidths.area - 5 });
        doc.text(it.esEpp ? 'X' : '', 335, rowY + 4);
        doc.text(!it.esEpp ? 'X' : '', 370, rowY + 4);

        const centerTrab = 410 + (colWidths.firmaTrab - imgW) / 2;
        const centerResp = 500 + (colWidths.firmaResp - imgW) / 2;
        if (firmaTrabBuf) {
          try {
            doc.image(firmaTrabBuf, centerTrab, rowY + 4, { width: imgW, height: imgH });
          } catch {
            doc.fontSize(7).fillColor('#6b7280').text('-', 410, rowY + 20);
          }
        } else {
          doc.fontSize(7).fillColor('#6b7280').text('-', 410, rowY + 20);
        }
        if (firmaRespBuf) {
          try {
            doc.image(firmaRespBuf, centerResp, rowY + 4, { width: imgW, height: imgH });
          } catch {
            doc.fontSize(7).fillColor('#6b7280').text('-', 500, rowY + 20);
          }
        } else {
          doc.fontSize(7).fillColor('#6b7280').text('-', 500, rowY + 20);
        }
        doc.fontSize(7).fillColor('#6b7280');
        doc.text(`${it.horaStr} - ${it.hashAuditoria}`, 40, rowY + rowHeight - 12, { width: 350 });
        doc.fillColor('#000000');
        rowY += rowHeight;
      }

      doc.end();
    });
  }

  getPdfPath(solicitudId: string): string | null {
    const filename = `registro-${solicitudId}.pdf`;
    const filepath = path.join(this.ensureUploadDir(), filename);
    return fs.existsSync(filepath) ? filepath : null;
  }

  /** Guarda el buffer en disco (fallback cuando GCS no está disponible). */
  saveBufferToDisk(solicitudId: string, buffer: Buffer): string {
    const dir = this.ensureUploadDir();
    const filename = `registro-${solicitudId}.pdf`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    return filepath;
  }

  private ensureKardexDir(): string {
    if (!fs.existsSync(KARDEX_UPLOAD_DIR)) {
      fs.mkdirSync(KARDEX_UPLOAD_DIR, { recursive: true });
    }
    return KARDEX_UPLOAD_DIR;
  }

  getKardexPdfPath(trabajadorId: string): string | null {
    const filename = `kardex-${trabajadorId}.pdf`;
    const filepath = path.join(this.ensureKardexDir(), filename);
    return fs.existsSync(filepath) ? filepath : null;
  }

  saveKardexToDisk(trabajadorId: string, buffer: Buffer): string {
    const dir = this.ensureKardexDir();
    const filename = `kardex-${trabajadorId}.pdf`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    return filepath;
  }
}
