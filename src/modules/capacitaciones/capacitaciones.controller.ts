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
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { ResponseCapacitacionDto } from './dto/response-capacitacion.dto';
import { CreateExamenCapacitacionDto } from './dto/create-examen-capacitacion.dto';
import { CreateEvaluacionFavoritaDto } from './dto/create-evaluacion-favorita.dto';
import { CreateResultadoExamenDto } from './dto/create-resultado-examen.dto';
import { EvaluarPasoDto } from './dto/evaluar-paso.dto';
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

  @Get('evaluaciones-favoritas')
  async obtenerEvaluacionesFavoritas(
    @Query('empresa_id') empresaId?: string,
    @CurrentUser() currentUser?: { empresaId?: string | null },
  ) {
    return this.capacitacionesService.obtenerEvaluacionesFavoritas(empresaId || currentUser?.empresaId);
  }

  @Post('evaluaciones-favoritas')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async crearEvaluacionFavorita(
    @Body() dto: CreateEvaluacionFavoritaDto,
    @CurrentUser() currentUser: { id: string; empresaId?: string | null },
  ) {
    return this.capacitacionesService.crearEvaluacionFavorita(dto, currentUser.id, currentUser.empresaId);
  }

  @Delete('evaluaciones-favoritas/:id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async eliminarEvaluacionFavorita(@Param('id', ParseUUIDPipe) id: string) {
    await this.capacitacionesService.eliminarEvaluacionFavorita(id);
    return { message: 'Evaluación favorita eliminada' };
  }

  @Get('mis-capacitaciones')
  async findMisCapacitaciones(
    @CurrentUser() currentUser: { trabajadorId?: string | null },
    @Query('estado_registro') estadoRegistro?: string, // 'pendiente' | 'completado'
    @Query('grupo') grupo?: string,
    @Query('tipo') tipo?: string,
  ) {
    if (!currentUser?.trabajadorId) {
      throw new BadRequestException('El usuario debe tener un trabajador vinculado para ver sus capacitaciones');
    }
    return this.capacitacionesService.findMisCapacitaciones(currentUser.trabajadorId, {
      estadoRegistro,
      grupo,
      tipo,
    });
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
    @Query('sede') sede?: string,
    @Query('gerencia') gerencia?: string,
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
      sede,
      gerencia,
    });
  }

  @Get(':id/para-trabajador')
  async findOneParaTrabajador(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: { trabajadorId?: string | null },
  ) {
    if (!currentUser?.trabajadorId) {
      throw new BadRequestException('El usuario debe tener un trabajador vinculado');
    }
    return this.capacitacionesService.findOneParaTrabajador(id, currentUser.trabajadorId);
  }

  @Post(':id/evaluar-paso')
  async evaluarPaso(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @CurrentUser() currentUser: { trabajadorId?: string | null },
    @Body() dto: EvaluarPasoDto,
  ) {
    if (!currentUser?.trabajadorId) {
      throw new BadRequestException('El usuario debe tener un trabajador vinculado');
    }
    return this.capacitacionesService.evaluarPaso(capacitacionId, currentUser.trabajadorId, dto);
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

  @Post(':id/participantes')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async agregarParticipante(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Body('trabajador_id') trabajadorId: string,
  ) {
    if (!trabajadorId) throw new BadRequestException('trabajador_id es obligatorio');
    return this.capacitacionesService.agregarParticipante(capacitacionId, trabajadorId);
  }

  @Patch(':id/asistencias/:trabajadorId')
  async actualizarAsistencia(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Body('asistencia') asistencia: boolean,
    @Body('calificacion') calificacion?: number,
    @Body('aprobado') aprobado?: boolean,
    @Body('firmo') firmo?: boolean,
  ) {
    await this.capacitacionesService.actualizarAsistencia(
      capacitacionId,
      trabajadorId,
      asistencia,
      calificacion,
      aprobado,
      firmo,
    );
    return { message: 'Asistencia actualizada correctamente' };
  }

  @Delete(':id/participantes/:trabajadorId')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async retirarParticipante(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
  ) {
    return this.capacitacionesService.retirarParticipante(capacitacionId, trabajadorId);
  }

  @Get(':id/certificado/:trabajadorId')
  async obtenerUrlCertificado(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
  ) {
    const result = await this.capacitacionesService.obtenerUrlCertificado(capacitacionId, trabajadorId);
    if (!result) throw new NotFoundException('Certificado no disponible para este trabajador');
    return result;
  }

  @Get(':id/resultado-evaluacion/:trabajadorId')
  async obtenerResultadoEvaluacion(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
  ) {
    const result = await this.capacitacionesService.obtenerResultadoEvaluacion(capacitacionId, trabajadorId);
    if (!result) throw new NotFoundException('Resultado de evaluación no disponible');
    return result;
  }

  @Post('examenes/rendir')
  async rendirExamen(@Body() dto: CreateResultadoExamenDto) {
    return this.capacitacionesService.rendirExamen(dto);
  }

  @Get(':id/adjuntos')
  async obtenerAdjuntos(@Param('id', ParseUUIDPipe) capacitacionId: string) {
    return this.capacitacionesService.obtenerAdjuntos(capacitacionId);
  }

  @Post(':id/adjuntos')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  @UseInterceptors(FileInterceptor('file'))
  async crearAdjunto(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Body('titulo') titulo: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: { id: string },
  ) {
    if (!file) throw new BadRequestException('Debe seleccionar un archivo');
    if (!titulo?.trim()) throw new BadRequestException('El título es obligatorio');
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) throw new BadRequestException('El archivo no debe superar 10 MB');
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Formatos permitidos: Excel, Word, PDF, PNG, JPG, JPEG');
    }
    return this.capacitacionesService.crearAdjunto(
      capacitacionId,
      titulo.trim(),
      file.buffer,
      file.mimetype,
      file.originalname,
      currentUser.id,
    );
  }

  @Delete('adjuntos/:adjuntoId')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async eliminarAdjunto(@Param('adjuntoId', ParseUUIDPipe) adjuntoId: string) {
    await this.capacitacionesService.eliminarAdjunto(adjuntoId);
    return { message: 'Adjunto eliminado' };
  }
}
