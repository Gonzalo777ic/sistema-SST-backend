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

  @Get('catalogo/epps-anteriormente-solicitados')
  async getEppsAnteriormenteSolicitados(
    @Query('trabajador_id') trabajadorId: string,
    @Query('empresa_id') empresaId: string,
  ) {
    return this.eppService.getEppsAnteriormenteSolicitados(trabajadorId, empresaId);
  }

  @Get('catalogo/favoritos')
  async getFavoritosEpp(
    @Query('trabajador_id') trabajadorId: string,
  ): Promise<{ epp_ids: string[] }> {
    const ids = await this.eppService.getFavoritosEpp(trabajadorId);
    return { epp_ids: ids };
  }

  @Post('catalogo/favoritos/:eppId/toggle')
  async toggleFavoritoEpp(
    @Param('eppId', ParseUUIDPipe) eppId: string,
    @CurrentUser() currentUser?: { id: string; trabajadorId?: string | null },
  ) {
    const trabajadorId = currentUser?.trabajadorId;
    if (!trabajadorId) {
      throw new BadRequestException('Debe tener un trabajador vinculado para usar favoritos');
    }
    return this.eppService.toggleFavoritoEpp(trabajadorId, eppId);
  }

  @Get('catalogo')
  async findAllEpp(
    @Query('empresa_id') empresaId?: string,
    @Query('empresa_ids') empresaIds?: string,
    @Query('include_deactivated') includeDeactivated?: string,
  ): Promise<ResponseEppDto[]> {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    const include = includeDeactivated === 'true' || includeDeactivated === '1';
    return this.eppService.findAllEpp(empresaId, ids, include);
  }

  @Patch('catalogo/:id/desactivar')
  async desactivarEpp(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.eppService.softDeleteEpp(id);
    return { message: 'EPP desactivado correctamente' };
  }

  @Patch('catalogo/:id/activar')
  async activarEpp(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEppDto> {
    return this.eppService.restoreEpp(id);
  }

  @Get('catalogo/:id')
  async findOneEpp(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEppDto> {
    return this.eppService.findOneEpp(id);
  }

  @Get('catalogo/:id/tiene-entregas')
  async eppTieneEntregas(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ tiene_entregas: boolean }> {
    const tiene = await this.eppService.eppTieneEntregas(id);
    return { tiene_entregas: tiene };
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
    @Body('observaciones') observaciones?: string,
    @Body('firma_recepcion_url') firmaRecepcionUrl?: string,
    @Body('firma_recepcion_base64') firmaRecepcionBase64?: string,
    @Body('password') password?: string,
    @CurrentUser() currentUser?: { id: string; dni: string },
  ): Promise<ResponseSolicitudEppDto> {
    return this.eppService.updateEstado(
      id,
      estado,
      currentUser?.id,
      {
        comentariosAprobacion,
        observaciones,
        firmaRecepcionUrl,
        firmaRecepcionBase64,
        password,
      },
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

  @Get('kardex-pdf/:trabajadorId')
  async getKardexPdf(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.eppService.getKardexPdfBuffer(trabajadorId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kardex-epp-${trabajadorId}.pdf"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.send(buffer);
  }

  @Get('kardex-pdf-solicitud/:solicitudId')
  async getKardexPdfBySolicitud(
    @Param('solicitudId', ParseUUIDPipe) solicitudId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.eppService.getKardexPdfBufferBySolicitud(solicitudId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kardex-solicitud-${solicitudId}.pdf"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.send(buffer);
  }

  @Get('registro-pdf/:solicitudId')
  async getRegistroPdf(
    @Param('solicitudId', ParseUUIDPipe) solicitudId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.eppService.getRegistroPdfBuffer(solicitudId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="registro-entrega-${solicitudId}.pdf"`);
    res.send(buffer);
  }

  @Get('reportes/estados-epp')
  async getReporteEstadosEpp(@Query('empresa_ids') empresaIds?: string) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getReporteEstadosEpp(ids);
  }

  @Get('reportes/entregas-por-empresa')
  async getReporteEntregasPorEmpresa(@Query('empresa_ids') empresaIds?: string) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getReporteEntregasPorEmpresa(ids);
  }

  @Get('reportes/entregas-por-empresa-area')
  async getReporteEntregasPorEmpresaArea(@Query('empresa_ids') empresaIds?: string) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getReporteEntregasPorEmpresaArea(ids);
  }

  @Get('reportes/entregas-por-mes')
  async getReporteEntregasPorMes(
    @Query('empresa_ids') empresaIds?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getReporteEntregasPorMes(ids, fechaDesde, fechaHasta);
  }

  @Get('reportes/entregas-por-sede')
  async getReporteEntregasPorSede(@Query('empresa_ids') empresaIds?: string) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getReporteEntregasPorSede(ids);
  }

  @Get('reportes/epps-mas-solicitados')
  async getReporteEppsMasSolicitados(@Query('empresa_ids') empresaIds?: string) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getReporteEppsMasSolicitados(ids);
  }

  @Get('reportes/trabajador-costo-historico')
  async getReporteTrabajadorCostoHistorico(@Query('empresa_ids') empresaIds?: string) {
    const ids = empresaIds ? empresaIds.split(',').filter(Boolean) : undefined;
    return this.eppService.getReporteTrabajadorCostoHistorico(ids);
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
