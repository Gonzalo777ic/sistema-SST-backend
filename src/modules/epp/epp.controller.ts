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
  ParseEnumPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { EppService } from './epp.service';
import { EppPdfService } from './epp-pdf.service';
import { CreateSolicitudEppDto } from './dto/create-solicitud-epp.dto';
import { UpdateSolicitudEppDto } from './dto/update-solicitud-epp.dto';
import { ResponseSolicitudEppDto } from './dto/response-solicitud-epp.dto';
import { CreateEppDto } from './dto/create-epp.dto';
import { UpdateEppDto } from './dto/update-epp.dto';
import { ResponseEppDto } from './dto/response-epp.dto';
import { EstadoSolicitudEPP } from './entities/solicitud-epp.entity';
import { EstadoVigenciaKardex } from './dto/response-kardex-list.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('epp')
@UseGuards(JwtAuthGuard)
export class EppController {
  constructor(
    private readonly eppService: EppService,
    private readonly eppPdfService: EppPdfService,
  ) {}

  // ========== CRUD EPP (Catálogo) ==========

  @Post('catalogo/upload-imagen')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEppImagen(
    @UploadedFile() file: Express.Multer.File,
    @Body('empresa_id') empresaId?: string,
  ): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Debe seleccionar un archivo de imagen');
    const url = await this.eppService.uploadEppImagen(empresaId, file.buffer, file.mimetype);
    return { url };
  }

  @Post('catalogo/upload-ficha-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEppFichaPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('empresa_id') empresaId?: string,
  ): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Debe seleccionar un archivo PDF');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF');
    }
    const url = await this.eppService.uploadEppFichaPdf(empresaId, file.buffer);
    return { url };
  }

  @Post('catalogo')
  async createEpp(@Body() dto: CreateEppDto): Promise<ResponseEppDto> {
    return this.eppService.createEpp(dto);
  }

  @Get('catalogo')
  async findAllEpp(
    @Query('empresa_id') empresaId?: string,
    @Query('empresa_ids') empresaIds?: string,
  ): Promise<ResponseEppDto[]> {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.findAllEpp(empresaId, ids);
  }

  @Get('catalogo/:id')
  async findOneEpp(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEppDto> {
    return this.eppService.findOneEpp(id);
  }

  @Patch('catalogo/:id')
  async updateEpp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEppDto,
  ): Promise<ResponseEppDto> {
    return this.eppService.updateEpp(id, dto);
  }

  // ========== CRUD Solicitudes ==========

  @Post('solicitudes')
  async create(@Body() dto: CreateSolicitudEppDto): Promise<ResponseSolicitudEppDto> {
    return this.eppService.create(dto);
  }

  @Get('solicitudes')
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('usuario_epp_id') usuarioEppId?: string,
    @Query('solicitante_id') solicitanteId?: string,
    @Query('estado') estado?: EstadoSolicitudEPP,
    @Query('area_id') areaId?: string,
    @Query('sede') sede?: string,
  ): Promise<ResponseSolicitudEppDto[]> {
    return this.eppService.findAll(
      empresaId,
      usuarioEppId,
      solicitanteId,
      estado,
      areaId,
      sede,
    );
  }

  @Get('solicitudes/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolicitudEppDto> {
    return this.eppService.findOne(id);
  }

  @Patch('solicitudes/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSolicitudEppDto,
  ): Promise<ResponseSolicitudEppDto> {
    return this.eppService.update(id, dto);
  }

  @Patch('solicitudes/:id/detalle/:detalleId/exceptuar')
  async toggleExceptuar(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('detalleId', ParseUUIDPipe) detalleId: string,
    @CurrentUser() currentUser?: { id: string; dni: string },
  ): Promise<ResponseSolicitudEppDto> {
    return this.eppService.toggleExceptuar(id, detalleId, currentUser?.id);
  }

  @Post('solicitudes/:id/detalle')
  async agregarDetalle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('epp_id') eppId: string,
    @Body('cantidad') cantidad?: number,
    @CurrentUser() currentUser?: { id: string; dni: string },
  ): Promise<ResponseSolicitudEppDto> {
    if (!eppId || typeof eppId !== 'string') {
      throw new BadRequestException('epp_id es requerido');
    }
    return this.eppService.agregarDetalle(id, eppId, cantidad ?? 1, currentUser?.id);
  }

  @Patch('solicitudes/:id/estado')
  async updateEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estado', new ParseEnumPipe(EstadoSolicitudEPP)) estado: EstadoSolicitudEPP,
    @Body('comentarios_aprobacion') comentariosAprobacion?: string,
    @Body('firma_recepcion_url') firmaRecepcionUrl?: string,
    @CurrentUser() currentUser?: { id: string; dni: string },
  ): Promise<ResponseSolicitudEppDto> {
    return this.eppService.updateEstado(
      id,
      estado,
      currentUser?.id,
      comentariosAprobacion,
      firmaRecepcionUrl,
    );
  }

  @Delete('solicitudes/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.eppService.remove(id);
  }

  // ========== Kardex ==========

  @Get('kardex/:trabajadorId')
  async getKardexPorTrabajador(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
  ) {
    return this.eppService.getKardexPorTrabajador(trabajadorId);
  }

  @Get('ultimo-kardex-pdf/:trabajadorId')
  async getUltimoKardexPdf(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
  ) {
    return this.eppService.getUltimoKardexPdfUrl(trabajadorId);
  }

  @Get('registro-pdf/:solicitudId')
  async getRegistroPdf(
    @Param('solicitudId', ParseUUIDPipe) solicitudId: string,
    @Res() res: Response,
  ) {
    const filepath = this.eppPdfService.getPdfPath(solicitudId);
    if (!filepath) {
      throw new NotFoundException('PDF de registro no encontrado');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filepath);
  }

  @Get('kardex-list')
  async getKardexList(
    @Query('empresa_ids') empresaIds?: string,
    @Query('nombre') nombre?: string,
    @Query('estado') estado?: EstadoVigenciaKardex,
    @Query('categoria') categoria?: string,
    @Query('unidad') unidad?: string,
    @Query('sede') sede?: string,
    @Query('area_id') areaId?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getKardexList(ids, {
      nombre,
      estado,
      categoria,
      unidad,
      sede,
      area_id: areaId,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    });
  }
}
