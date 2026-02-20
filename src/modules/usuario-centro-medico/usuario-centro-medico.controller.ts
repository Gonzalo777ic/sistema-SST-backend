import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsuarioCentroMedicoService } from './usuario-centro-medico.service';
import { CreateParticipacionDto } from './dto/create-participacion.dto';
import { AgregarUsuarioACentroDto } from './dto/agregar-usuario-centro.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('usuario-centro-medico')
export class UsuarioCentroMedicoController {
  constructor(private readonly service: UsuarioCentroMedicoService) {}

  @Get('participaciones-agrupadas')
  @UseGuards(JwtAuthGuard)
  async getParticipacionesAgrupadas() {
    return this.service.findAllAgrupadasPorCentro();
  }

  @Get('participaciones-por-centro/:centroMedicoId')
  @UseGuards(JwtAuthGuard)
  async getParticipacionesPorCentro(@Param('centroMedicoId') centroMedicoId: string) {
    return this.service.findByCentro(centroMedicoId);
  }

  @Get('participaciones/:usuarioId')
  @UseGuards(JwtAuthGuard)
  async getParticipaciones(
    @Param('usuarioId') usuarioId: string,
    @Query('incluirRevocadas') incluirRevocadas?: string,
  ) {
    if (incluirRevocadas === 'true') {
      return this.service.findByUsuarioIncluyendoRevocadas(usuarioId);
    }
    return this.service.findByUsuario(usuarioId);
  }

  @Post('participacion')
  @UseGuards(JwtAuthGuard)
  async addParticipacion(@Body() dto: CreateParticipacionDto) {
    return this.service.addParticipacion(dto);
  }

  @Post('agregar-usuario-a-centro')
  @UseGuards(JwtAuthGuard)
  async agregarUsuarioACentro(@Body() dto: AgregarUsuarioACentroDto) {
    return this.service.agregarUsuarioACentro(dto.dni, dto.centro_medico_id);
  }

  @Post('participacion/:id/vincular-usuario')
  @UseGuards(JwtAuthGuard)
  async vincularUsuario(
    @Param('id') id: string,
    @Body('usuario_id') usuarioId: string,
  ) {
    return this.service.vincularUsuarioARegistro(id, usuarioId);
  }

  @Post('participacion/:id/reactivar')
  @UseGuards(JwtAuthGuard)
  async reactivar(@Param('id') id: string) {
    return this.service.reactivarParticipacion(id);
  }

  @Delete('participacion/:id')
  @UseGuards(JwtAuthGuard)
  async revocar(@Param('id') id: string) {
    await this.service.revocarParticipacion(id);
    return { message: 'Participación revocada correctamente' };
  }

  @Delete('usuario/:usuarioId/centro/:centroMedicoId')
  @UseGuards(JwtAuthGuard)
  async desvincular(
    @Param('usuarioId') usuarioId: string,
    @Param('centroMedicoId') centroMedicoId: string,
  ) {
    await this.service.desvincularDeCentro(usuarioId, centroMedicoId);
    return { message: 'Usuario desvinculado del centro médico' };
  }

  @Post('participacion/:id/activar')
  @UseGuards(JwtAuthGuard)
  async activar(@Param('id') id: string) {
    return this.service.activarParticipacion(id);
  }

  @Post('participacion/:id/desactivar')
  @UseGuards(JwtAuthGuard)
  async desactivar(@Param('id') id: string) {
    return this.service.desactivarParticipacion(id);
  }
}
