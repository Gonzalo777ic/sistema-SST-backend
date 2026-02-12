import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { SolicitudEPP } from './entities/solicitud-epp.entity';
import { CategoriaEPP } from './entities/epp.entity';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'registros-epp');

export interface PdfResult {
  buffer: Buffer;
  hashAuditoria: string;
}

@Injectable()
export class EppPdfService {
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
   */
  async generateRegistroEntregaPdf(solicitud: SolicitudEPP): Promise<PdfResult> {
    const detalles = (solicitud.detalles || []).filter((d) => !d.exceptuado);
    if (detalles.length === 0) {
      throw new Error('No hay items entregados para generar el registro');
    }

    const empresa = solicitud.empresa as any;
    const solicitante = solicitud.solicitante as any;
    const entregadoPor = solicitud.entregadoPor as any;

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
      doc.text('-', 150, y);
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
        const codigo = det.codigoAuditoria || det.id?.substring(0, 8) || '-';
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
        doc.fontSize(7).fillColor('#6b7280');
        doc.text(`${horaStr} - ${codigo}`, 410, rowY + 35, { width: colWidths.firmaTrab - 10 });
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
}
