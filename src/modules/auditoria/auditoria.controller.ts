import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UsuarioRol.SUPER_ADMIN)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('logs')
  async getLogs(
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
    @Query('usuario_id') usuarioId?: string,
    @Query('trabajador_id') trabajadorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditoriaService.findLogs({
      fechaDesde,
      fechaHasta,
      usuarioId,
      trabajadorId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('logs/exportar')
  async exportarLogs(
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
    @Query('usuario_id') usuarioId?: string,
    @Query('trabajador_id') trabajadorId?: string,
  ) {
    return this.auditoriaService.exportarLogs({
      fechaDesde,
      fechaHasta,
      usuarioId,
      trabajadorId,
    });
  }
}
