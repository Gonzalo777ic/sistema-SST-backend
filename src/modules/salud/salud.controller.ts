import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SaludService } from './salud.service';
import { CreateExamenMedicoDto } from './dto/create-examen-medico.dto';
import { UpdateExamenMedicoDto } from './dto/update-examen-medico.dto';
import { ResponseExamenMedicoDto } from './dto/response-examen-medico.dto';
import { CreateCitaMedicaDto } from './dto/create-cita-medica.dto';
import { UpdateCitaMedicaDto } from './dto/update-cita-medica.dto';
import { ResponseCitaMedicaDto } from './dto/response-cita-medica.dto';
import { CreateComentarioMedicoDto } from './dto/create-comentario-medico.dto';
import { UpdateComentarioMedicoDto } from './dto/update-comentario-medico.dto';
import { ResponseComentarioMedicoDto } from './dto/response-comentario-medico.dto';
import { CreateHorarioDoctorDto } from './dto/create-horario-doctor.dto';
import { UpdateHorarioDoctorDto } from './dto/update-horario-doctor.dto';
import { ResponseHorarioDoctorDto } from './dto/response-horario-doctor.dto';
import { CreateSeguimientoMedicoDto } from './dto/create-seguimiento-medico.dto';
import { UpdateSeguimientoMedicoDto } from './dto/update-seguimiento-medico.dto';

@Controller('salud')
@UseGuards(JwtAuthGuard)
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  // ========== EXÁMENES MÉDICOS ==========
  @Post('examenes')
  async createExamen(
    @Body() dto: CreateExamenMedicoDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ): Promise<ResponseExamenMedicoDto> {
    return this.saludService.createExamen(dto, user);
  }

  @Get('examenes')
  async findAllExamenes(
    @Query('trabajador_id') trabajadorId?: string,
    @Query('centro_medico_id') centroMedicoId?: string,
  ): Promise<ResponseExamenMedicoDto[]> {
    return this.saludService.findAllExamenes(trabajadorId, centroMedicoId);
  }

  /** IMPORTANTE: Rutas más específicas ANTES de examenes/:id para evitar que :id capture "123/documentos" */
  @Get('examenes/:id/resultado/url-firmada')
  async getSignedUrlResultadoExamen(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; roles: string[] },
    @Req() req: unknown,
  ) {
    const r = req as { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } };
    const ip = (r.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? r.socket?.remoteAddress ?? null;
    return this.saludService.getSignedUrlResultadoExamen(id, user, {
      ipAddress: ip ?? undefined,
      userAgent: (r.headers?.['user-agent'] as string) ?? undefined,
    });
  }

  @Get('examenes/:examenId/documentos/:docId/url-firmada')
  async getSignedUrlDocumentoExamen(
    @Param('examenId', ParseUUIDPipe) examenId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: { id: string; roles: string[] },
    @Req() req: unknown,
  ) {
    const r = req as { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } };
    const ip = (r.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? r.socket?.remoteAddress ?? null;
    return this.saludService.getSignedUrlForDocumentoExamen(examenId, docId, user, {
      ipAddress: ip ?? undefined,
      userAgent: (r.headers?.['user-agent'] as string) ?? undefined,
    });
  }

  @Get('examenes/:id/documentos')
  async findDocumentosExamen(@Param('id', ParseUUIDPipe) id: string) {
    return this.saludService.findDocumentosExamen(id);
  }

  @Get('examenes/:id')
  async findOneExamen(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ): Promise<ResponseExamenMedicoDto> {
    return this.saludService.findOneExamen(id, user);
  }

  @Patch('examenes/:id')
  async updateExamen(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExamenMedicoDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ): Promise<ResponseExamenMedicoDto> {
    return this.saludService.updateExamen(id, dto, user);
  }

  @Delete('examenes/:id')
  async removeExamen(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.saludService.removeExamen(id);
  }

  @Get('pruebas-medicas')
  async getPruebasMedicas(
    @Query('incluir_inactivos') incluirInactivos?: string,
  ): Promise<Array<{ id: string; nombre: string; activo?: boolean }>> {
    const incluir = incluirInactivos === 'true' || incluirInactivos === '1';
    if (incluir) {
      return this.saludService.findAllPruebasMedicasAdmin(true);
    }
    return this.saludService.findAllPruebasMedicas();
  }

  @Post('pruebas-medicas')
  async createPruebaMedica(@Body('nombre') nombre: string) {
    if (!nombre?.trim()) {
      throw new BadRequestException('El nombre es obligatorio');
    }
    return this.saludService.createPruebaMedica(nombre);
  }

  @Patch('pruebas-medicas/:id')
  async updatePruebaMedica(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { nombre?: string; activo?: boolean },
  ) {
    return this.saludService.updatePruebaMedica(id, dto);
  }

  @Post('examenes/:id/documentos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumentoExamen(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('prueba_medica_id') pruebaMedicaId: string,
    @Body('tipo_etiqueta') tipoEtiqueta: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    if (!file) throw new BadRequestException('Debe seleccionar un archivo');
    const validMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.mimetype)) {
      throw new BadRequestException('Formatos permitidos: PDF, JPEG, PNG, WebP, GIF');
    }
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) throw new BadRequestException('El archivo no debe superar 10 MB');
    return this.saludService.uploadDocumentoExamen(
      id,
      file,
      pruebaMedicaId || null,
      tipoEtiqueta || null,
      user,
    );
  }

  @Delete('examenes/:examenId/documentos/:docId')
  async removeDocumentoExamen(
    @Param('examenId', ParseUUIDPipe) examenId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    await this.saludService.removeDocumentoExamen(examenId, docId);
  }

  @Post('examenes/:id/upload-resultado')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResultadoExamen(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    if (!file) throw new BadRequestException('Debe seleccionar un archivo PDF');
    return this.saludService.uploadResultadoExamen(id, file, user);
  }

  @Post('examenes/:id/notificar-resultados')
  async notificarResultadosListos(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    return this.saludService.notificarResultadosListos(id, user);
  }

  // ========== SEGUIMIENTOS (Interconsultas y Vigilancia) ==========
  @Post('examenes/:id/seguimientos')
  async createSeguimiento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSeguimientoMedicoDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    return this.saludService.createSeguimiento(id, dto, user);
  }

  @Patch('examenes/:examenId/seguimientos/:segId')
  async updateSeguimiento(
    @Param('examenId', ParseUUIDPipe) examenId: string,
    @Param('segId', ParseUUIDPipe) segId: string,
    @Body() dto: UpdateSeguimientoMedicoDto,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    return this.saludService.updateSeguimiento(examenId, segId, dto, user);
  }

  @Delete('examenes/:examenId/seguimientos/:segId')
  async removeSeguimiento(
    @Param('examenId', ParseUUIDPipe) examenId: string,
    @Param('segId', ParseUUIDPipe) segId: string,
    @CurrentUser() user: { id: string; roles: string[] },
  ) {
    await this.saludService.removeSeguimiento(examenId, segId, user);
  }

  // ========== CITAS MÉDICAS ==========
  @Post('citas')
  async createCita(@Body() dto: CreateCitaMedicaDto): Promise<ResponseCitaMedicaDto> {
    return this.saludService.createCita(dto);
  }

  @Get('citas')
  async findAllCitas(
    @Query('trabajador_id') trabajadorId?: string,
    @Query('doctor_id') doctorId?: string,
    @Query('centro_medico_id') centroMedicoId?: string,
  ): Promise<ResponseCitaMedicaDto[]> {
    return this.saludService.findAllCitas(trabajadorId, doctorId, centroMedicoId);
  }

  @Get('citas/:id')
  async findOneCita(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCitaMedicaDto> {
    return this.saludService.findOneCita(id);
  }

  @Patch('citas/:id')
  async updateCita(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCitaMedicaDto,
  ): Promise<ResponseCitaMedicaDto> {
    return this.saludService.updateCita(id, dto);
  }

  @Delete('citas/:id')
  async removeCita(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.saludService.removeCita(id);
  }

  // ========== COMENTARIOS MÉDICOS ==========
  @Post('comentarios')
  async createComentario(
    @Body() dto: CreateComentarioMedicoDto,
  ): Promise<ResponseComentarioMedicoDto> {
    return this.saludService.createComentario(dto);
  }

  @Get('comentarios')
  async findAllComentarios(
    @Query('examen_id') examenId?: string,
    @Query('trabajador_id') trabajadorId?: string,
  ): Promise<ResponseComentarioMedicoDto[]> {
    return this.saludService.findAllComentarios(examenId, trabajadorId);
  }

  @Get('comentarios/:id')
  async findOneComentario(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseComentarioMedicoDto> {
    return this.saludService.findOneComentario(id);
  }

  @Patch('comentarios/:id')
  async updateComentario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComentarioMedicoDto,
  ): Promise<ResponseComentarioMedicoDto> {
    return this.saludService.updateComentario(id, dto);
  }

  @Delete('comentarios/:id')
  async removeComentario(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.saludService.removeComentario(id);
  }

  // ========== HORARIOS DOCTOR ==========
  @Post('horarios')
  async createHorario(@Body() dto: CreateHorarioDoctorDto): Promise<ResponseHorarioDoctorDto> {
    return this.saludService.createHorario(dto);
  }

  @Get('horarios')
  async findAllHorarios(
    @Query('doctor_id') doctorId?: string,
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponseHorarioDoctorDto[]> {
    return this.saludService.findAllHorarios(doctorId, empresaId);
  }

  @Get('horarios/:id')
  async findOneHorario(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseHorarioDoctorDto> {
    return this.saludService.findOneHorario(id);
  }

  @Patch('horarios/:id')
  async updateHorario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHorarioDoctorDto,
  ): Promise<ResponseHorarioDoctorDto> {
    return this.saludService.updateHorario(id, dto);
  }

  @Delete('horarios/:id')
  async removeHorario(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.saludService.removeHorario(id);
  }
}
