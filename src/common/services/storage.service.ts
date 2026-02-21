import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import { randomUUID } from 'crypto';

export type StorageTipo = 'firma_trabajador' | 'firma_usuario' | 'firma_recepcion' | 'firma_capacitador' | 'firma_gerente' | 'firma_medico' | 'sello_medico' | 'pdf_entrega' | 'kardex_pdf' | 'certificado_capacitacion' | 'logo_empresa' | 'imagen_epp' | 'ficha_pdf_epp' | 'foto_trabajador' | 'adjunto_capacitacion' | 'centro_medico_pdf' | 'documento_emo';

@Injectable()
export class StorageService {
  private storage: Storage | null = null;
  private bucketName: string = '';
  private initialized = false;

  private async ensureInit(): Promise<void> {
    if (this.initialized) return;

    const projectId = process.env.GCP_PROJECT_ID;
    const bucketName = process.env.GCP_BUCKET_NAME;
    const keyFilename = process.env.GCP_KEY_FILE;

    if (!bucketName) {
      console.warn('GCP_BUCKET_NAME no configurado. Storage deshabilitado.');
      this.initialized = true;
      return;
    }

    this.bucketName = bucketName;

    try {
      this.storage = new Storage({
        projectId: projectId || undefined,
        keyFilename: keyFilename ? path.resolve(process.cwd(), keyFilename) : undefined,
      });
      this.initialized = true;
    } catch (err) {
      console.error('Error inicializando GCS:', err);
      this.initialized = true;
    }
  }

  /**
   * Sube un archivo al bucket GCS.
   * Organización: {rucEmpresa}/{tipo}/{filename}
   */
  async uploadFile(
    rucEmpresa: string,
    buffer: Buffer,
    tipo: StorageTipo,
    options?: {
      filename?: string;
      contentType?: string;
      metadata?: Record<string, string>;
    },
  ): Promise<string> {
    await this.ensureInit();

    if (!this.storage) {
      throw new Error('Storage no configurado. Verifique GCP_BUCKET_NAME y GCP_KEY_FILE.');
    }

    let ext = 'png';
    if (tipo === 'pdf_entrega' || tipo === 'kardex_pdf' || tipo === 'ficha_pdf_epp' || tipo === 'certificado_capacitacion' || tipo === 'centro_medico_pdf') ext = 'pdf';
    else if ((tipo === 'adjunto_capacitacion' || tipo === 'documento_emo') && options?.contentType) {
      const ct = options.contentType.toLowerCase();
      if (ct.includes('pdf')) ext = 'pdf';
      else if (ct.includes('spreadsheet') || ct.includes('excel')) ext = 'xlsx';
      else if (ct.includes('wordprocessing') || ct.includes('msword')) ext = 'docx';
      else if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg';
      else if (ct.includes('png')) ext = 'png';
    } else if (options?.contentType) {
      const m = options.contentType.match(/image\/(jpeg|jpg|png|webp|gif)/);
      if (m) ext = m[1] === 'jpg' ? 'jpeg' : m[1];
    }
    const filename = options?.filename || `${randomUUID()}.${ext}`;
    const objectPath = `${rucEmpresa}/${tipo}/${filename}`.replace(/[^a-zA-Z0-9/._-]/g, '_');

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectPath);

    const contentType = options?.contentType || (tipo === 'pdf_entrega' || tipo === 'kardex_pdf' || tipo === 'ficha_pdf_epp' || tipo === 'certificado_capacitacion' || tipo === 'centro_medico_pdf' ? 'application/pdf' : tipo === 'adjunto_capacitacion' || tipo === 'documento_emo' ? 'application/octet-stream' : 'image/png');

    await file.save(buffer, {
      contentType,
      metadata: options?.metadata,
    });

    return `https://storage.googleapis.com/${this.bucketName}/${objectPath}`;
  }

  /**
   * Verifica si el storage está disponible
   */
  isAvailable(): boolean {
    return !!process.env.GCP_BUCKET_NAME;
  }

  /**
   * Elimina un archivo de GCS por su URL pública.
   * Útil para borrar la foto anterior antes de sobrescribir.
   */
  async deleteFileByUrl(publicUrl: string): Promise<void> {
    await this.ensureInit();
    if (!this.storage || !publicUrl?.includes('storage.googleapis.com')) return;
    const canonicalUrl = this.getCanonicalUrl(publicUrl);
    const match = canonicalUrl.match(
      new RegExp(`https://storage\\.googleapis\\.com/${this.bucketName}/(.+)`),
    );
    if (!match) return;
    await this.storage.bucket(this.bucketName).file(match[1]).delete({ ignoreNotFound: true });
  }

  /**
   * Extrae la URL canónica (sin query params) de una URL de GCS.
   * Útil para normalizar URLs firmadas antes de guardar en BD.
   */
  getCanonicalUrl(url: string): string {
    if (!url?.includes('storage.googleapis.com')) return url;
    return url.split('?')[0];
  }

  /**
   * Descarga un archivo desde GCS dado su URL canónica.
   */
  async downloadFile(publicUrl: string): Promise<Buffer> {
    await this.ensureInit();
    if (!this.storage) {
      throw new Error('Storage no configurado');
    }
    const canonicalUrl = this.getCanonicalUrl(publicUrl);
    const match = canonicalUrl.match(
      new RegExp(`https://storage\\.googleapis\\.com/${this.bucketName}/(.+)`),
    );
    if (!match) {
      throw new Error('URL no válida de GCS');
    }
    const objectPath = match[1];
    const [buffer] = await this.storage.bucket(this.bucketName).file(objectPath).download();
    return buffer;
  }

  /**
   * Genera una URL firmada para un objeto GCS almacenado en la URL pública.
   * Útil cuando el bucket no tiene acceso público y los objetos requieren autenticación.
   */
  async getSignedUrl(publicUrl: string, expiresInMinutes = 60): Promise<string> {
    await this.ensureInit();

    if (!this.storage) {
      return publicUrl;
    }

    const canonicalUrl = this.getCanonicalUrl(publicUrl);
    const match = canonicalUrl.match(
      new RegExp(`https://storage\\.googleapis\\.com/${this.bucketName}/(.+)`),
    );
    if (!match) {
      return publicUrl;
    }

    const objectPath = match[1];
    const file = this.storage.bucket(this.bucketName).file(objectPath);

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return signedUrl;
  }
}
