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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
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

  @Get('examenes/:id/documentos')
  async findDocumentosExamen(@Param('id', ParseUUIDPipe) id: string) {
    return this.saludService.findDocumentosExamen(id);
  }

  @Post('examenes/:id/documentos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumentoExamen(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
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
    return this.saludService.uploadDocumentoExamen(id, file, tipoEtiqueta || '', user);
  }

  @Delete('examenes/:examenId/documentos/:docId')
  async removeDocumentoExamen(
    @Param('examenId', ParseUUIDPipe) examenId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    await this.saludService.removeDocumentoExamen(examenId, docId);
  }

  @Post('examenes/:id/notificar-resultados')
  async notificarResultadosListos(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.saludService.notificarResultadosListos(id);
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
