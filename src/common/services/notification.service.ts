import { Injectable } from '@nestjs/common';

export enum PrioridadNotificacion {
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta',
  Urgente = 'Urgente',
}

export enum TipoNotificacion {
  EPPPendiente = 'EPP Pendiente',
  CapacitacionProgramada = 'Capacitación Programada',
  ExamenMedicoPorVencer = 'Examen Médico Por Vencer',
  PermisoPendiente = 'Permiso Pendiente',
  IncidenteReportado = 'Incidente Reportado',
  DocumentoPorVencer = 'Documento Por Vencer',
  AccionCorrectivaPendiente = 'Acción Correctiva Pendiente',
}

@Injectable()
export class NotificationService {
  /**
   * Envía una notificación por email (simulado con console.log por ahora)
   * @param destinatarioEmail Email del destinatario
   * @param titulo Título de la notificación
   * @param mensaje Mensaje de la notificación
   * @param prioridad Prioridad de la notificación
   */
  async enviarEmail(
    destinatarioEmail: string,
    titulo: string,
    mensaje: string,
    prioridad: PrioridadNotificacion = PrioridadNotificacion.Media,
  ): Promise<void> {
    // Simulación de envío de email
    console.log('📧 EMAIL ENVIADO:', {
      to: destinatarioEmail,
      subject: titulo,
      body: mensaje,
      prioridad,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrar con nodemailer o servicio de email real
    // Ejemplo con nodemailer:
    // await this.mailerService.sendMail({
    //   to: destinatarioEmail,
    //   subject: titulo,
    //   text: mensaje,
    // });
  }

  /**
   * Crea una notificación en el sistema (persistente)
   * @param destinatarioId ID del usuario destinatario
   * @param titulo Título de la notificación
   * @param mensaje Mensaje de la notificación
   * @param tipo Tipo de notificación
   * @param prioridad Prioridad
   * @param accionUrl URL de acción (opcional)
   * @param moduloOrigen Módulo origen (opcional)
   * @param registroId ID del registro origen (opcional)
   */
  async crearNotificacion(
    destinatarioId: string,
    titulo: string,
    mensaje: string,
    tipo: TipoNotificacion,
    prioridad: PrioridadNotificacion = PrioridadNotificacion.Media,
    accionUrl?: string,
    moduloOrigen?: string,
    registroId?: string,
  ): Promise<void> {
    // Simulación de creación de notificación en BD
    console.log('🔔 NOTIFICACIÓN CREADA:', {
      destinatarioId,
      titulo,
      mensaje,
      tipo,
      prioridad,
      accionUrl,
      moduloOrigen,
      registroId,
      timestamp: new Date().toISOString(),
    });

    // TODO: Persistir en tabla de notificaciones
    // Ejemplo:
    // await this.notificacionRepository.save({
    //   destinatarioId,
    //   titulo,
    //   mensaje,
    //   tipo,
    //   prioridad,
    //   accionUrl,
    //   moduloOrigen,
    //   registroId,
    //   leida: false,
    //   fechaCreacion: new Date(),
    // });
  }

  /**
   * Envía notificación de vencimiento
   */
  async notificarVencimiento(
    destinatarioId: string,
    destinatarioEmail: string,
    tipo: string,
    itemNombre: string,
    fechaVencimiento: Date,
  ): Promise<void> {
    const diasRestantes = Math.ceil(
      (fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    const titulo = `${tipo} por vencer: ${itemNombre}`;
    const mensaje = `El ${tipo.toLowerCase()} "${itemNombre}" vence el ${fechaVencimiento.toLocaleDateString()} (${diasRestantes} días restantes).`;

    await this.crearNotificacion(
      destinatarioId,
      titulo,
      mensaje,
      TipoNotificacion.DocumentoPorVencer,
      diasRestantes < 7 ? PrioridadNotificacion.Alta : PrioridadNotificacion.Media,
      undefined,
      tipo,
    );

    await this.enviarEmail(destinatarioEmail, titulo, mensaje);
  }

  /**
   * Envía notificación de aprobación pendiente
   */
  async notificarAprobacionPendiente(
    destinatarioId: string,
    destinatarioEmail: string,
    tipo: string,
    itemNombre: string,
    accionUrl: string,
  ): Promise<void> {
    const titulo = `Aprobación pendiente: ${tipo}`;
    const mensaje = `Tienes una ${tipo.toLowerCase()} "${itemNombre}" pendiente de aprobación.`;

    await this.crearNotificacion(
      destinatarioId,
      titulo,
      mensaje,
      TipoNotificacion.PermisoPendiente,
      PrioridadNotificacion.Media,
      accionUrl,
      tipo,
    );

    await this.enviarEmail(destinatarioEmail, titulo, mensaje);
  }

  /**
   * Envía notificación de incidente crítico
   */
  async notificarIncidenteCritico(
    destinatarioId: string,
    destinatarioEmail: string,
    incidenteId: string,
    severidad: string,
  ): Promise<void> {
    const titulo = `⚠️ ALERTA: Incidente ${severidad} reportado`;
    const mensaje = `Se ha reportado un incidente de severidad ${severidad}. Revisa los detalles inmediatamente.`;

    await this.crearNotificacion(
      destinatarioId,
      titulo,
      mensaje,
      TipoNotificacion.IncidenteReportado,
      PrioridadNotificacion.Urgente,
      `/incidentes/${incidenteId}`,
      'Incidente',
      incidenteId,
    );

    await this.enviarEmail(destinatarioEmail, titulo, mensaje);
  }
}
