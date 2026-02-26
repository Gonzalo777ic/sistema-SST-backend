import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Notificacion } from './entities/notificacion.entity';

export const EVENTO_NOTIFICACION_CREAR = 'notificacion.crear';

export interface PayloadNotificacionCrear {
  usuarioId: string;
  titulo: string;
  mensaje: string;
  rutaRedireccion?: string | null;
  tipo: string;
}

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  @OnEvent(EVENTO_NOTIFICACION_CREAR)
  async handleCrear(payload: PayloadNotificacionCrear) {
    const notif = this.notificacionRepository.create({
      usuarioId: payload.usuarioId,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      rutaRedireccion: payload.rutaRedireccion ?? null,
      tipo: payload.tipo,
    });
    await this.notificacionRepository.save(notif);
  }

  async findAllByUsuario(usuarioId: string) {
    return this.notificacionRepository.find({
      where: { usuarioId },
      order: { createdAt: 'DESC' },
    });
  }

  async getNoLeidas(usuarioId: string) {
    const [count, recientes] = await Promise.all([
      this.notificacionRepository.count({ where: { usuarioId, leida: false } }),
      this.notificacionRepository.find({
        where: { usuarioId },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);
    return { count, recientes };
  }

  async marcarComoLeida(id: string, usuarioId: string) {
    const notif = await this.notificacionRepository.findOne({
      where: { id, usuarioId },
    });
    if (!notif) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notif.leida = true;
    await this.notificacionRepository.save(notif);
    return notif;
  }

  async marcarTodasComoLeidas(usuarioId: string) {
    await this.notificacionRepository.update(
      { usuarioId, leida: false },
      { leida: true },
    );
  }
}
