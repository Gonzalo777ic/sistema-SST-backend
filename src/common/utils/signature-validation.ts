import { BadRequestException } from '@nestjs/common';

/**
 * Valida que una firma digital (imagen base64) no esté vacía.
 * Criterio: una firma real introduce entropía y datos; una imagen vacía es altamente predecible y ligera.
 * Umbral mínimo: 600 bytes (PNG vacío ~200-400 bytes; firma mínima ~1KB+).
 */
const MIN_SIGNATURE_BYTES = 600;

export function isValidSignatureBase64(dataUrl: string): boolean {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return false;
  }
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  if (!base64Data) return false;
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer.length >= MIN_SIGNATURE_BYTES;
  } catch {
    return false;
  }
}

export function validateSignatureOrThrow(dataUrl: string, context = 'firma'): void {
  if (!dataUrl || dataUrl === '') return;
  if (!isValidSignatureBase64(dataUrl)) {
    throw new BadRequestException(
      `La ${context} no es válida. Debe contener un trazo real (no se permiten firmas en blanco).`
    );
  }
}
