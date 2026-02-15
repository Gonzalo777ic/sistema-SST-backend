import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { ResponseCapacitacionDto } from './dto/response-capacitacion.dto';
import { CreateExamenCapacitacionDto } from './dto/create-examen-capacitacion.dto';
import { CreateResultadoExamenDto } from './dto/create-resultado-examen.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('capacitaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

  @Post()
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async create(
    @Body() dto: CreateCapacitacionDto,
    @CurrentUser() currentUser: { id: string; empresaId?: string | null },
  ): Promise<ResponseCapacitacionDto> {
    return this.capacitacionesService.create(dto, currentUser);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('tipo') tipo?: string,
    @Query('tema') tema?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
    @Query('estado') estado?: string,
    @Query('razon_social') razonSocial?: string,
    @Query('grupo') grupo?: string,
    @Query('area') area?: string,
    @Query('responsable') responsable?: string,
    @Query('unidad') unidad?: string,
  ): Promise<ResponseCapacitacionDto[]> {
    return this.capacitacionesService.findAll({
      empresaId,
      tipo,
      tema,
      fechaDesde,
      fechaHasta,
      estado,
      razonSocial,
      grupo,
      area,
      responsable,
      unidad,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseCapacitacionDto> {
    return this.capacitacionesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCapacitacionDto,
  ): Promise<ResponseCapacitacionDto> {
    return this.capacitacionesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.capacitacionesService.remove(id);
  }

  @Post(':id/examenes')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async crearExamen(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Body() dto: CreateExamenCapacitacionDto,
  ) {
    return this.capacitacionesService.crearExamen({
      ...dto,
      capacitacion_id: capacitacionId,
    });
  }

  @Get(':id/examenes')
  async obtenerExamenes(@Param('id', ParseUUIDPipe) capacitacionId: string) {
    return this.capacitacionesService.obtenerExamenesPorCapacitacion(capacitacionId);
  }

  @Patch(':id/asistencias/:trabajadorId')
  async actualizarAsistencia(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Body('asistencia') asistencia: boolean,
    @Body('calificacion') calificacion?: number,
  ) {
    await this.capacitacionesService.actualizarAsistencia(
      capacitacionId,
      trabajadorId,
      asistencia,
      calificacion,
    );
    return { message: 'Asistencia actualizada correctamente' };
  }

  @Post('examenes/rendir')
  async rendirExamen(@Body() dto: CreateResultadoExamenDto) {
    return this.capacitacionesService.rendirExamen(dto);
  }
}
