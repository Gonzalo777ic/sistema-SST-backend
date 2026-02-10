/**
 * Utilidades para manejo seguro de fechas en DTOs
 * Maneja casos donde TypeORM devuelve strings en lugar de objetos Date
 */

/**
 * Convierte una fecha a string de forma segura (solo fecha, sin hora)
 * Útil para campos de tipo 'date' en PostgreSQL
 */
export function safeDateToString(date: Date | string | null | undefined): string | null {
  if (date === null || date === undefined) {
    return null;
  }

  // Si ya es un string, validar formato y retornar
  if (typeof date === 'string') {
    // Si es un string ISO válido con hora (ej: "2024-01-15T10:30:00Z"), retornar solo la fecha
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    // Si ya es solo fecha en formato YYYY-MM-DD, retornar tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Si es otro formato de fecha string, intentar extraer la parte de fecha
    // o retornar tal cual si no se puede parsear
    return date;
  }

  // Si es un objeto Date
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // Fallback: convertir a string y extraer fecha
  const dateStr = String(date);
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
}

/**
 * Convierte una fecha datetime a Date de forma segura
 * Útil para campos de tipo 'timestamp' o 'datetime' en PostgreSQL
 */
export function safeDateTimeToDate(date: Date | string | null | undefined): Date | null {
  if (date === null || date === undefined) {
    return null;
  }

  // Si ya es un objeto Date, retornar tal cual
  if (date instanceof Date) {
    return date;
  }

  // Si es un string, convertir a Date
  if (typeof date === 'string') {
    const parsed = new Date(date);
    // Validar que la conversión fue exitosa
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date string: ${date}`);
    }
    return parsed;
  }

  // Fallback: intentar convertir
  return new Date(date);
}
