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
   * Para GCS: usa downloadFile (service account) o fetch si la URL está firmada.
   */
  private async fetchImageBuffer(url: string | null | undefined): Promise<Buffer | null> {
    if (!url?.trim()) return null;
    try {
      if (url.startsWith('data:')) {
        const base64Match = url.match(/^data:image\/\w+;base64,(.+)$/);
        if (base64Match) return Buffer.from(base64Match[1], 'base64');
      }
      if (url.includes('storage.googleapis.com')) {
        if (this.storageService.isAvailable()) {
          try {
            return await this.storageService.downloadFile(url);
          } catch {
            // Fallback: URL firmada (con ?) puede descargarse vía fetch
            if (url.includes('?')) {
              const res = await fetch(url);
              if (res.ok) {
                const ab = await res.arrayBuffer();
                return Buffer.from(ab);
              }
            }
          }
        } else if (url.includes('?')) {
          // Storage no configurado: fetch con URL firmada
          const res = await fetch(url);
          if (res.ok) {
            const ab = await res.arrayBuffer();
            return Buffer.from(ab);
          }
        }
        return null;
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
   * @param logoUrlOverride - URL firmada del logo (prioridad sobre empresa.logoUrl) para cargar la imagen PNG.
   */
  async generateRegistroEntregaPdf(solicitud: SolicitudEPP, logoUrlOverride?: string): Promise<PdfResult> {
    const detalles = (solicitud.detalles || []).filter((d) => !d.exceptuado);
    if (detalles.length === 0) {
      throw new Error('No hay items entregados para generar el registro');
    }

    const empresa = solicitud.empresa as any;
    const solicitante = solicitud.solicitante as any;
    const entregadoPor = solicitud.entregadoPor as any;

    const firmaTrabajadorUrl = solicitud.firmaRecepcionUrl ?? solicitante?.firmaDigitalUrl ?? null;
    const firmaResponsableUrl = entregadoPor?.firmaUrl ?? null;

    const logoUrl = logoUrlOverride ?? empresa?.logoUrl;
    const [logoBuf, firmaTrabajadorBuf, firmaResponsableBuf] = await Promise.all([
      this.fetchImageBuffer(logoUrl),
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
    const fechaStr = fechaEntrega.toLocaleDateString('es-PE');
    const fechaHoraStr = fechaEntrega.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const M = 40;
    const pageW = 595.28 - M * 2;
    const logoSize = 70;

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), hashAuditoria }));
      doc.on('error', reject);
      doc.strokeColor('#000000');

      let y = M;

      // --- FILA 1: ENCABEZADO (Logo y Título) ---
      const headerH = 60;
      const logoW = 140;
      doc.rect(M, y, logoW, headerH).stroke();
      doc.rect(M + logoW, y, pageW - logoW, headerH).stroke();

      if (logoBuf) {
        try {
          doc.image(logoBuf, M + 5, y + 5, { fit: [logoW - 10, headerH - 10], align: 'center', valign: 'center' });
        } catch {
          doc.fontSize(7).font('Helvetica').text('Logo', M + 10, y + 25);
        }
      }

      doc.fontSize(11).font('Helvetica-Bold');
      doc.text(
        'REGISTRO DE ENTREGA DE EQUIPO DE PROTECCIÓN PERSONAL Y UNIFORME',
        M + logoW, y + 25,
        { width: pageW - logoW, align: 'center' }
      );
      
      y += headerH; // Avanzamos sin dejar huecos

      // --- FILAS 2 y 3: DATOS DE LA EMPRESA ---
      const colW = [140, 60, 110, 150, pageW - 460]; // Suman exactamente pageW
      const labels = ['RAZON SOCIAL O DETERMINACION SOCIAL', 'RUC', 'DIRECCIÓN', 'ACTIVIDAD ECONÓMICA', 'Nº TRABAJADORES'];
      const vals = [
        empresa?.nombre || '-',
        empresa?.ruc || '-',
        empresa?.direccion || '-',
        (empresa?.actividadEconomica || '-').substring(0, 50),
        String(empresa?.numeroTrabajadores ?? '-'),
      ];

      // Fila de etiquetas
      const labelH = 24; // <-- AUMENTADO de 15 a 24 para soportar 2 líneas
      doc.fontSize(6.5).font('Helvetica-Bold'); // <-- Letra ligeramente más pequeña (6.5)
      let currentX = M;
      for (let c = 0; c < 5; c++) {
        doc.rect(currentX, y, colW[c], labelH).stroke();
        // y + 5 o y + 6 para centrar el texto verticalmente en la nueva altura
        doc.text(labels[c], currentX + 2, y + 5, { width: colW[c] - 4, align: 'center' });
        currentX += colW[c];
      }
      y += labelH;

      // Fila de valores
      const valH = 25;
      doc.fontSize(7).font('Helvetica'); // Restauramos tamaño 7 para los datos
      currentX = M;
      for (let c = 0; c < 5; c++) {
        doc.rect(currentX, y, colW[c], valH).stroke();
        doc.text(vals[c], currentX + 3, y + 5, { width: colW[c] - 6, align: 'center' });
        currentX += colW[c];
      }
      y += valH;

      // --- FILAS 4 y 5: RESPONSABLE Y TRABAJADOR ---
      const rowInfoH = 18;
      
      // Fila Responsable
      doc.rect(M, y, 140, rowInfoH).stroke();
      doc.rect(M + 140, y, pageW - 140, rowInfoH).stroke();
      doc.font('Helvetica-Bold').text('RESPONSABLE DE ENTREGA:', M + 3, y + 5);
      doc.font('Helvetica').text(responsableNombre, M + 145, y + 5);
      y += rowInfoH;

      // Fila Trabajador
      doc.rect(M, y, 140, rowInfoH).stroke(); // Label Nombre
      doc.rect(M + 140, y, 220, rowInfoH).stroke(); // Valor Nombre
      doc.rect(M + 360, y, 40, rowInfoH).stroke(); // Label DNI
      doc.rect(M + 400, y, pageW - 400, rowInfoH).stroke(); // Valor DNI

      doc.font('Helvetica-Bold').text('APELLIDOS Y NOMBRES:', M + 3, y + 5);
      doc.font('Helvetica').text(solicitante?.nombreCompleto || '-', M + 145, y + 5);
      doc.font('Helvetica-Bold').text('DNI:', M + 365, y + 5);
      doc.font('Helvetica').text(solicitante?.documentoIdentidad || '-', M + 405, y + 5);
      y += rowInfoH;

      // --- FILA 6: CABECERAS DE LA TABLA ---
      const colWidths = { desc: 140, cant: 35, fecha: 50, area: 70, epp: 30, unif: 30, firmaTrab: 80, firmaResp: pageW - 435 };
      const tableHeaderH = 28;

      doc.fontSize(7).font('Helvetica-Bold');
      let x = M;
      doc.rect(x, y, colWidths.desc, tableHeaderH).stroke();
      doc.text('DESCRIPCIÓN DE LO ENTREGADO', x + 2, y + 10, { width: colWidths.desc - 4, align: 'center' });
      x += colWidths.desc;
      doc.rect(x, y, colWidths.cant, tableHeaderH).stroke();
      doc.text('CANTIDAD', x + 2, y + 10, { width: colWidths.cant - 4, align: 'center' });
      x += colWidths.cant;
      doc.rect(x, y, colWidths.fecha, tableHeaderH).stroke();
      doc.text('FECHA DE ENTREGA', x + 2, y + 6, { width: colWidths.fecha - 4, align: 'center' });
      x += colWidths.fecha;
      doc.rect(x, y, colWidths.area, tableHeaderH).stroke();
      doc.text('AREA DE TRABAJO', x + 2, y + 10, { width: colWidths.area - 4, align: 'center' });
      x += colWidths.area;
      
      // Celda dividida para SE ENTREGO
      doc.rect(x, y, colWidths.epp + colWidths.unif, 14).stroke();
      doc.text('SE ENTREGO:', x + 2, y + 3, { width: colWidths.epp + colWidths.unif - 4, align: 'center' });
      doc.rect(x, y + 14, colWidths.epp, 14).stroke();
      doc.text('EPP', x + 2, y + 16, { width: colWidths.epp - 4, align: 'center' });
      doc.rect(x + colWidths.epp, y + 14, colWidths.unif, 14).stroke();
      doc.text('UNIFORME', x + colWidths.epp, y + 16, { width: colWidths.unif, align: 'center' });
      x += (colWidths.epp + colWidths.unif);

      doc.rect(x, y, colWidths.firmaTrab, tableHeaderH).stroke();
      doc.text('FIRMA DEL TRABAJADOR', x + 2, y + 6, { width: colWidths.firmaTrab - 4, align: 'center' });
      x += colWidths.firmaTrab;
      doc.rect(x, y, colWidths.firmaResp, tableHeaderH).stroke();
      doc.text('FIRMA DEL RESPONSABLE', x + 2, y + 6, { width: colWidths.firmaResp - 4, align: 'center' });
      
      y += tableHeaderH;
      doc.font('Helvetica');

      // --- FILAS DE DATOS ---
      const rowHeight = 58;
      const imgW = 60;
      const imgH = 32;

      for (const det of detalles) {
        const nombre = (det as any).eppNombreHistorico ?? (det.epp as any)?.nombre ?? '-';
        const descripcion = (det as any).eppDescripcionHistorica ?? (det.epp as any)?.descripcion;
        const categoria = (det as any).eppCategoriaHistorica ?? (det.epp as any)?.categoria;
        const desc = `${nombre}${descripcion ? `, ${descripcion}` : ''}`.substring(0, 40);
        const esEpp = categoria === CategoriaEPP.EPP;
        const horaStr = det.fechaHoraEntrega
          ? new Date(det.fechaHoraEntrega).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : fechaStr;
        const hashLine = `${horaStr.replace(',', '')} - ${hashAuditoria}`;

        x = M;
        doc.rect(x, y, colWidths.desc, rowHeight).stroke();
        doc.text(desc, x + 3, y + 4, { width: colWidths.desc - 6 });
        x += colWidths.desc;
        doc.rect(x, y, colWidths.cant, rowHeight).stroke();
        doc.text(String(det.cantidad), x + 3, y + 25, { width: colWidths.cant - 6, align: 'center' });
        x += colWidths.cant;
        doc.rect(x, y, colWidths.fecha, rowHeight).stroke();
        doc.text(fechaStr, x + 3, y + 25, { width: colWidths.fecha - 6, align: 'center' });
        x += colWidths.fecha;
        doc.rect(x, y, colWidths.area, rowHeight).stroke();
        doc.text(areaNombre, x + 3, y + 20, { width: colWidths.area - 6, align: 'center' });
        x += colWidths.area;
        doc.rect(x, y, colWidths.epp, rowHeight).stroke();
        doc.text(esEpp ? 'X' : '', x + 3, y + 25, { width: colWidths.epp - 6, align: 'center' });
        x += colWidths.epp;
        doc.rect(x, y, colWidths.unif, rowHeight).stroke();
        doc.text(!esEpp ? 'X' : '', x + 3, y + 25, { width: colWidths.unif - 6, align: 'center' });
        x += colWidths.unif;

        const cellTrabX = x;
        const cellRespX = x + colWidths.firmaTrab;
        doc.rect(cellTrabX, y, colWidths.firmaTrab, rowHeight).stroke();
        doc.rect(cellRespX, y, colWidths.firmaResp, rowHeight).stroke();

        const centerTrabX = cellTrabX + (colWidths.firmaTrab - imgW) / 2;
        const centerRespX = cellRespX + (colWidths.firmaResp - imgW) / 2;
        const hashH = 12;
        const imgAreaH = rowHeight - hashH;
        const centerTrabY = y + (imgAreaH - imgH) / 2;
        const centerRespY = y + (rowHeight - imgH) / 2;

        if (firmaTrabajadorBuf) {
          try { doc.image(firmaTrabajadorBuf, centerTrabX, centerTrabY, { width: imgW, height: imgH }); } catch { /* silenciado */ }
        }
        
        doc.fontSize(6).fillColor('#4b5563');
        doc.text(hashLine, cellTrabX + 2, y + rowHeight - hashH - 1, { width: colWidths.firmaTrab - 4, align: 'center' });
        doc.fillColor('#000000').fontSize(7);

        if (firmaResponsableBuf) {
          try { doc.image(firmaResponsableBuf, centerRespX, centerRespY, { width: imgW, height: imgH }); } catch { /* silenciado */ }
        }

        y += rowHeight;
      }

      doc.end();
    });
  }

  /**
   * Genera el PDF de kardex consolidado del trabajador con TODOS los items de TODAS las entregas.
   * Se invoca cada vez que se marca una solicitud como ENTREGADA.
   * @param logoUrlOverride - URL firmada del logo (prioridad sobre empresa.logoUrl) para cargar la imagen PNG.
   */
  async generateKardexPdfPorTrabajador(
    trabajador: any,
    solicitudesEntregadas: SolicitudEPP[],
    logoUrlOverride?: string,
  ): Promise<Buffer> {
    const solicitudesOrdenadas = [...solicitudesEntregadas].sort((a, b) => {
      const dA = a.fechaEntrega ? new Date(a.fechaEntrega).getTime() : 0;
      const dB = b.fechaEntrega ? new Date(b.fechaEntrega).getTime() : 0;
      return dB - dA;
    });

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

    for (const sol of solicitudesOrdenadas) {
      const empresa = sol.empresa as any;
      const solicitante = sol.solicitante as any;
      const entregadoPor = sol.entregadoPor as any;
      const areaNombre = (solicitante?.area as any)?.nombre || solicitante?.area?.nombre || '-';
      const hashAuditoria = EppPdfService.getHashAuditoria(sol.id);
      const firmaResponsableUrl = entregadoPor?.firmaUrl ?? null;

      for (const det of sol.detalles || []) {
        if (det.exceptuado) continue;
        const nombre = (det as any).eppNombreHistorico ?? (det.epp as any)?.nombre ?? '-';
        const descripcion = (det as any).eppDescripcionHistorica ?? (det.epp as any)?.descripcion;
        const categoria = (det as any).eppCategoriaHistorica ?? (det.epp as any)?.categoria;
        const desc = `${nombre}${descripcion ? `, ${descripcion}` : ''}`.substring(0, 45);
        const esEpp = categoria === CategoriaEPP.EPP;
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

    // Logo: empresa del trabajador solicitante (prioridad) o de la primera solicitud
    const empresa =
      (trabajador as any)?.empresa ??
      (solicitudesOrdenadas[0]?.empresa as any) ??
      (solicitudesOrdenadas[0]?.solicitante as any)?.empresa;
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

    const logoUrl = logoUrlOverride ?? empresa?.logoUrl;
    const logoBuf = await this.fetchImageBuffer(logoUrl);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const M = 40;
    const pageW = 595.28 - M * 2;
    const logoSize = 70;
    const colWidths = {
      desc: 130,
      cant: 38,
      fecha: 52,
      area: 75,
      seEntrego: 38,
      firmaTrab: 88,
      firmaResp: 83,
    };
    const rowHeight = 58;
    const imgW = 60;
    const imgH = 30;
    const hashH = 12;

    return new Promise(async (resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.strokeColor('#000000');

      let y = M;

      // --- DEFINICIONES DE TABLA ---
      const headerH = 60;
      const logoW = 140;
      const colW = [140, 60, 110, 150, pageW - 460];
      const colWidths = { desc: 140, cant: 35, fecha: 50, area: 70, epp: 30, unif: 30, firmaTrab: 80, firmaResp: pageW - 435 };
      const rowInfoH = 18;
      const tableHeaderH = 28;
      const rowHeight = 58;
      const imgW = 60;
      const imgH = 30;
      const hashH = 12;
      const pageBottom = 841.89 - M;

      const drawGridHeaders = () => {
        // --- FILA 1: ENCABEZADO ---
        doc.rect(M, y, logoW, headerH).stroke();
        doc.rect(M + logoW, y, pageW - logoW, headerH).stroke();
        
        if (logoBuf) {
          try { doc.image(logoBuf, M + 5, y + 5, { fit: [logoW - 10, headerH - 10], align: 'center', valign: 'center' }); } 
          catch { doc.fontSize(7).font('Helvetica').text('Logo', M + 10, y + 25); }
        }

        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('KARDEX DE EPP - REGISTRO HISTÓRICO DE ENTREGAS', M + logoW, y + 25, { width: pageW - logoW, align: 'center' });
        y += headerH;

        const labels = ['RAZON SOCIAL O DENOMINACION SOCIAL', 'RUC', 'DIRECCIÓN', 'ACTIVIDAD ECONÓMICA', 'Nº TRABAJADORES'];
        const vals = [ empresa?.nombre || '-', empresa?.ruc || '-', empresa?.direccion || '-', (empresa?.actividadEconomica || '-').substring(0, 50), String(empresa?.numeroTrabajadores ?? '-') ];

        doc.fontSize(6.5).font('Helvetica-Bold');
        let currentX = M;
        for (let c = 0; c < 5; c++) {
          doc.rect(currentX, y, colW[c], 24).stroke();
          doc.text(labels[c], currentX + 2, y + 5, { width: colW[c] - 4, align: 'center' });
          currentX += colW[c];
        }
        y += 24; 

        doc.fontSize(7).font('Helvetica');
        currentX = M;
        for (let c = 0; c < 5; c++) {
          doc.rect(currentX, y, colW[c], 25).stroke();
          doc.text(vals[c], currentX + 3, y + 5, { width: colW[c] - 6, align: 'center' });
          currentX += colW[c];
        }
        y += 25;

        doc.rect(M, y, 140, rowInfoH).stroke();
        doc.rect(M + 140, y, 220, rowInfoH).stroke();
        doc.rect(M + 360, y, 40, rowInfoH).stroke();
        doc.rect(M + 400, y, pageW - 400, rowInfoH).stroke();
        doc.font('Helvetica-Bold').text('TRABAJADOR:', M + 3, y + 5);
        doc.font('Helvetica').text(solicitante?.nombreCompleto || '-', M + 145, y + 5);
        doc.font('Helvetica-Bold').text('DNI:', M + 365, y + 5);
        doc.font('Helvetica').text(solicitante?.documentoIdentidad || '-', M + 405, y + 5);
        y += rowInfoH;

        // Responsable
        doc.rect(M, y, 140, rowInfoH).stroke();
        doc.rect(M + 140, y, pageW - 140, rowInfoH).stroke();
        doc.font('Helvetica-Bold').text('RESPONSABLE DE ENTREGA:', M + 3, y + 5);
        doc.font('Helvetica').text(responsableNombre, M + 145, y + 5);
        y += rowInfoH;

        // --- FILA 6: CABECERAS TABLA DETALLE ---
        doc.fontSize(7).font('Helvetica-Bold');
        let x = M;
        doc.rect(x, y, colWidths.desc, tableHeaderH).stroke();
        doc.text('DESCRIPCIÓN DE LO ENTREGADO', x + 2, y + 10, { width: colWidths.desc - 4, align: 'center' });
        x += colWidths.desc;
        doc.rect(x, y, colWidths.cant, tableHeaderH).stroke();
        doc.text('CANTIDAD', x + 2, y + 10, { width: colWidths.cant - 4, align: 'center' });
        x += colWidths.cant;
        doc.rect(x, y, colWidths.fecha, tableHeaderH).stroke();
        doc.text('FECHA DE ENTREGA', x + 2, y + 6, { width: colWidths.fecha - 4, align: 'center' });
        x += colWidths.fecha;
        doc.rect(x, y, colWidths.area, tableHeaderH).stroke();
        doc.text('AREA DE TRABAJO', x + 2, y + 10, { width: colWidths.area - 4, align: 'center' });
        x += colWidths.area;
        
        doc.rect(x, y, colWidths.epp + colWidths.unif, 14).stroke();
        doc.text('SE ENTREGO:', x + 2, y + 3, { width: colWidths.epp + colWidths.unif - 4, align: 'center' });
        doc.rect(x, y + 14, colWidths.epp, 14).stroke();
        doc.text('EPP', x + 2, y + 16, { width: colWidths.epp - 4, align: 'center' });
        doc.rect(x + colWidths.epp, y + 14, colWidths.unif, 14).stroke();
        doc.text('UNIF.', x + colWidths.epp, y + 16, { width: colWidths.unif, align: 'center' });
        x += (colWidths.epp + colWidths.unif);

        doc.rect(x, y, colWidths.firmaTrab, tableHeaderH).stroke();
        doc.text('FIRMA DEL TRABAJADOR', x + 2, y + 6, { width: colWidths.firmaTrab - 4, align: 'center' });
        x += colWidths.firmaTrab;
        doc.rect(x, y, colWidths.firmaResp, tableHeaderH).stroke();
        doc.text('FIRMA DEL RESPONSABLE', x + 2, y + 6, { width: colWidths.firmaResp - 4, align: 'center' });
        
        y += tableHeaderH;
        doc.font('Helvetica');
      };

      drawGridHeaders();

      for (const it of items) {
        if (y + rowHeight > pageBottom) {
          doc.addPage({ size: 'A4', margin: M });
          y = M;
          drawGridHeaders();
        }

        const [firmaTrabBuf, firmaRespBuf] = await Promise.all([fetchFirma(it.firmaTrabajadorUrl), fetchFirma(it.firmaResponsableUrl)]);
        const hashLine = `${it.horaStr.replace(',', '')} - ${it.hashAuditoria}`;

        let x = M;
        doc.rect(x, y, colWidths.desc, rowHeight).stroke();
        doc.text(it.desc, x + 3, y + 4, { width: colWidths.desc - 6 });
        x += colWidths.desc;
        doc.rect(x, y, colWidths.cant, rowHeight).stroke();
        doc.text(String(it.cant), x + 3, y + 25, { width: colWidths.cant - 6, align: 'center' });
        x += colWidths.cant;
        doc.rect(x, y, colWidths.fecha, rowHeight).stroke();
        doc.text(it.fechaStr, x + 3, y + 25, { width: colWidths.fecha - 6, align: 'center' });
        x += colWidths.fecha;
        doc.rect(x, y, colWidths.area, rowHeight).stroke();
        doc.text(it.areaNombre, x + 3, y + 20, { width: colWidths.area - 6, align: 'center' });
        x += colWidths.area;
        doc.rect(x, y, colWidths.epp, rowHeight).stroke();
        doc.text(it.esEpp ? 'X' : '', x + 3, y + 25, { width: colWidths.epp - 6, align: 'center' });
        x += colWidths.epp;
        doc.rect(x, y, colWidths.unif, rowHeight).stroke();
        doc.text(!it.esEpp ? 'X' : '', x + 3, y + 25, { width: colWidths.unif - 6, align: 'center' });
        x += colWidths.unif;

        const cellTrabX = x;
        const cellRespX = x + colWidths.firmaTrab;
        doc.rect(cellTrabX, y, colWidths.firmaTrab, rowHeight).stroke();
        doc.rect(cellRespX, y, colWidths.firmaResp, rowHeight).stroke();

        const centerTrabX = cellTrabX + (colWidths.firmaTrab - imgW) / 2;
        const centerRespX = cellRespX + (colWidths.firmaResp - imgW) / 2;
        const imgAreaH = rowHeight - hashH;
        const centerTrabY = y + (imgAreaH - imgH) / 2;
        const centerRespY = y + (rowHeight - imgH) / 2;

        if (firmaTrabBuf) {
          try { doc.image(firmaTrabBuf, centerTrabX, centerTrabY, { width: imgW, height: imgH }); } catch { /* silenciado */ }
        }
        doc.fontSize(6).fillColor('#4b5563');
        doc.text(hashLine, cellTrabX + 2, y + rowHeight - hashH - 1, { width: colWidths.firmaTrab - 4, align: 'center' });
        doc.fillColor('#000000').fontSize(7);

        if (firmaRespBuf) {
          try { doc.image(firmaRespBuf, centerRespX, centerRespY, { width: imgW, height: imgH }); } catch { /* silenciado */ }
        }

        y += rowHeight;
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
