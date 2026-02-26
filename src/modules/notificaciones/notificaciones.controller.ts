import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.notificacionesService.findAllByUsuario(user.id);
  }

  @Get('no-leidas')
  async getNoLeidas(@CurrentUser() user: { id: string }) {
    return this.notificacionesService.getNoLeidas(user.id);
  }

  @Patch('leer-todas')
  async marcarTodasComoLeidas(@CurrentUser() user: { id: string }) {
    await this.notificacionesService.marcarTodasComoLeidas(user.id);
    return { ok: true };
  }

  @Patch(':id/leer')
  async marcarComoLeida(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.notificacionesService.marcarComoLeida(id, user.id);
  }
}
