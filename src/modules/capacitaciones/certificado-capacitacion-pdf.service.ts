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
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    const cap = capacitacion as any;
    const empresa = cap.empresa;
    const empresaId = empresa?.id ?? cap.empresaId;
    const tipoCap = cap.tipo || 'CAPACITACIÓN';
    const titulo = cap.titulo || 'Capacitación';
    const fechaCap = cap.fecha ? new Date(cap.fecha) : new Date();
    const fechaStr = fechaCap.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const duracionStr = this.formatDuracion(
      cap.duracionHoras ?? null,
      cap.duracionMinutos ?? null,
    );
    const nombreCompleto = trabajador.nombreCompleto || [trabajador.nombres, trabajador.apellidoPaterno, trabajador.apellidoMaterno].filter(Boolean).join(' ');
    const coordinador = nombreCoordinador || cap.instructorNombre || 'Coordinador SST';

    const [config, gerentes] = await Promise.all([
      this.configCapacitacionesService.getConfig(),
      empresaId ? this.firmasGerenteService.findForCertificado(empresaId) : Promise.resolve([]),
    ]);

    const fc = config.firmas_certificado ?? {
      responsable_rrhh: false,
      responsable_sst: false,
      capacitador: false,
      responsable_certificacion: false,
    };

    const firmasParaEstampar: FirmaItem[] = [];

    if (fc.responsable_rrhh) {
      const g = gerentes.find((x) => x.rol === 'RRHH');
      if (g) firmasParaEstampar.push({ nombre: g.nombre_completo, cargo: g.cargo || 'Responsable de RRHH', firma_url: g.firma_url });
    }
    if (fc.responsable_sst) {
      const g = gerentes.find((x) => x.rol === 'SST');
      if (g) firmasParaEstampar.push({ nombre: g.nombre_completo, cargo: g.cargo || 'Responsable de SST', firma_url: g.firma_url });
    }
    if (fc.capacitador) {
      firmasParaEstampar.push({ nombre: coordinador, cargo: 'Capacitador', firma_url: firmaCoordinadorUrl ?? null });
    }
    if (fc.responsable_certificacion) {
      const g = gerentes.find((x) => x.rol === 'CERTIFICACION');
      if (g) firmasParaEstampar.push({ nombre: g.nombre_completo, cargo: g.cargo || 'Responsable de Certificación', firma_url: g.firma_url });
    }

    doc.fontSize(22).font('Helvetica-Bold').text('CERTIFICADO', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text('Seguridad y Salud en el Trabajo', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica');
    doc.text(`Se certifica que ${nombreCompleto}`, { align: 'center' });
    doc.moveDown(1);
    doc.text(`Por haber aprobado la sesión de ${tipoCap.toUpperCase()} (nota: ${nota.toFixed(1)})`, { align: 'center' });
    doc.moveDown(0.5);
    doc.text(titulo, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(11);
    doc.text(`Duración: ${duracionStr}`, { align: 'center' });
    doc.text(`Fecha: ${fechaStr}`, { align: 'center' });
    doc.moveDown(2);

    if (firmasParaEstampar.length > 0) {
      await this.renderFirmas(doc, firmasParaEstampar);
    } else {
      doc.text(coordinador, { align: 'center' });
      doc.moveDown(0.5);
      if (firmaCoordinadorUrl) {
        const firmaBuf = await this.fetchImageBuffer(firmaCoordinadorUrl);
        if (firmaBuf) {
          try {
            doc.image(firmaBuf, doc.page.width / 2 - 60, doc.y, { width: 120, height: 60 });
            doc.moveDown(4);
          } catch {
            doc.moveDown(2);
          }
        } else {
          doc.moveDown(2);
        }
      } else {
        doc.moveDown(2);
      }
    }

    if (empresa?.nombre) {
      doc.fontSize(9).text(empresa.nombre, { align: 'center' });
    }

    doc.end();
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  private async renderFirmas(doc: PDFKit.PDFDocument, firmas: FirmaItem[]): Promise<void> {
    const margin = 50;
    const pageWidth = doc.page.width - 2 * margin;
    const cols = Math.min(firmas.length, 2);
    const cellWidth = pageWidth / cols;
    const imgW = 90;
    const imgH = 45;
    const baseY = doc.y;

    for (let i = 0; i < firmas.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellX = margin + col * cellWidth;
      const centerX = cellX + (cellWidth - imgW) / 2;
      const y = baseY + row * 75;

      const f = firmas[i];
      doc.fontSize(9).font('Helvetica').text(f.nombre, cellX, y, { width: cellWidth, align: 'center' });
      doc.fontSize(8).text(f.cargo, cellX, y + 12, { width: cellWidth, align: 'center' });

      if (f.firma_url) {
        const firmaBuf = await this.fetchImageBuffer(f.firma_url);
        if (firmaBuf) {
          try {
            doc.image(firmaBuf, centerX, y + 22, { width: imgW, height: imgH });
          } catch {
            // ignorar error de imagen
          }
        }
      }
    }

    const rows = Math.ceil(firmas.length / cols);
    doc.y = baseY + rows * 75 + 15;
  }
}
