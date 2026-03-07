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
import { MarcosNormativosService } from './marcos-normativos.service';
import { CreateMarcoNormativoDto } from './dto/create-marco-normativo.dto';
import { UpdateMarcoNormativoDto } from './dto/update-marco-normativo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('marcos-normativos')
@UseGuards(JwtAuthGuard)
export class MarcosNormativosController {
  constructor(private readonly marcosNormativosService: MarcosNormativosService) {}

  @Get()
  async findAll(@Query('empresa_id') empresaId?: string) {
    return this.marcosNormativosService.findAll(empresaId);
  }

  @Get('activos')
  async findAllActivos(@Query('empresa_id') empresaId: string) {
    return this.marcosNormativosService.findAllActivos(empresaId);
  }

  @Get('disponibles-para-vincular')
  async findAllDisponiblesParaVincular(@Query('empresa_id') empresaId: string) {
    return this.marcosNormativosService.findAllDisponiblesParaVincular(empresaId);
  }

  @Post(':id/vincular-empresa')
  async vincularEmpresa(
    @Param('id', ParseUUIDPipe) marcoId: string,
    @Body('empresa_id') empresaId: string,
  ) {
    return this.marcosNormativosService.vincularEmpresa(marcoId, empresaId);
  }

  @Delete(':id/desvincular-empresa/:empresaId')
  async desvincularEmpresa(
    @Param('id', ParseUUIDPipe) marcoId: string,
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    await this.marcosNormativosService.desvincularEmpresa(marcoId, empresaId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.marcosNormativosService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateMarcoNormativoDto) {
    return this.marcosNormativosService.create(dto);
  }

  @Post('seed-predeterminados')
  async crearMarcosPredeterminados(@Body('empresa_id') empresaId: string) {
    return this.marcosNormativosService.crearMarcosPredeterminados(empresaId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMarcoNormativoDto,
  ) {
    return this.marcosNormativosService.update(id, dto);
  }

  @Post(':id/documentos/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumento(
    @Param('id', ParseUUIDPipe) marcoId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('nombre') nombre?: string,
    @Body('empresa_id') empresaIdForRuc?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Debe seleccionar un archivo PDF');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('El archivo debe ser un PDF');
    }
    return this.marcosNormativosService.uploadDocumento(
      marcoId,
      file,
      nombre || file.originalname,
      empresaIdForRuc,
    );
  }

  @Get('documentos/:documentoId/url-firmada')
  async getSignedUrlDocumento(
    @Param('documentoId', ParseUUIDPipe) documentoId: string,
  ) {
    return this.marcosNormativosService.getSignedUrlDocumento(documentoId);
  }

  @Patch('documentos/:documentoId/desactivar')
  async desactivarDocumento(
    @Param('documentoId', ParseUUIDPipe) documentoId: string,
  ) {
    await this.marcosNormativosService.desactivarDocumento(documentoId);
  }

  @Patch('documentos/:documentoId/activar')
  async activarDocumento(
    @Param('documentoId', ParseUUIDPipe) documentoId: string,
  ) {
    await this.marcosNormativosService.activarDocumento(documentoId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.marcosNormativosService.softRemove(id);
  }
}
