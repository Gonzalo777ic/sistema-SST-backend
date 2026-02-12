import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import { randomUUID } from 'crypto';

export type StorageTipo = 'firma_trabajador' | 'firma_usuario' | 'pdf_entrega' | 'logo_empresa';

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
    if (tipo === 'pdf_entrega') ext = 'pdf';
    else if (options?.contentType) {
      const m = options.contentType.match(/image\/(jpeg|jpg|png|webp|gif)/);
      if (m) ext = m[1] === 'jpg' ? 'jpeg' : m[1];
    }
    const filename = options?.filename || `${randomUUID()}.${ext}`;
    const objectPath = `${rucEmpresa}/${tipo}/${filename}`.replace(/[^a-zA-Z0-9/._-]/g, '_');

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectPath);

    const contentType = options?.contentType || (tipo === 'pdf_entrega' ? 'application/pdf' : 'image/png');

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
   * Extrae la URL canónica (sin query params) de una URL de GCS.
   * Útil para normalizar URLs firmadas antes de guardar en BD.
   */
  getCanonicalUrl(url: string): string {
    if (!url?.includes('storage.googleapis.com')) return url;
    return url.split('?')[0];
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
