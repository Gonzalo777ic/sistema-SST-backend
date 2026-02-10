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
} from '@nestjs/common';
import { ComitesService } from './comites.service';
import { CreateComiteDto } from './dto/create-comite.dto';
import { UpdateComiteDto } from './dto/update-comite.dto';
import { ResponseComiteDto } from './dto/response-comite.dto';
import { CreateMiembroComiteDto } from './dto/create-miembro-comite.dto';
import { ResponseMiembroComiteDto } from './dto/response-miembro-comite.dto';
import { CreateDocumentoComiteDto } from './dto/create-documento-comite.dto';
import { ResponseDocumentoComiteDto } from './dto/response-documento-comite.dto';
import { CreateReunionComiteDto } from './dto/create-reunion-comite.dto';
import { UpdateReunionComiteDto } from './dto/update-reunion-comite.dto';
import { ResponseReunionComiteDto } from './dto/response-reunion-comite.dto';
import { CreateAcuerdoComiteDto } from './dto/create-acuerdo-comite.dto';
import { UpdateAcuerdoComiteDto } from './dto/update-acuerdo-comite.dto';
import { ResponseAcuerdoComiteDto } from './dto/response-acuerdo-comite.dto';

@Controller('comites')
export class ComitesController {
  constructor(private readonly comitesService: ComitesService) {}

  @Post()
  async create(@Body() dto: CreateComiteDto): Promise<ResponseComiteDto> {
    return this.comitesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponseComiteDto[]> {
    return this.comitesService.findAll(empresaId);
  }

  // Endpoints para gestión de reuniones (rutas estáticas antes de :id)
  @Get('reuniones')
  async findAllReuniones(
    @Query('comite_id') comiteId?: string,
    @Query('estado') estado?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
    @Query('tipo_reunion') tipoReunion?: string,
    @Query('descripcion') descripcion?: string,
  ): Promise<ResponseReunionComiteDto[]> {
    return this.comitesService.findAllReuniones({
      comiteId,
      estado,
      fechaDesde,
      fechaHasta,
      tipoReunion,
      descripcion,
    });
  }

  @Get('reuniones/:id')
  async findOneReunion(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseReunionComiteDto> {
    return this.comitesService.findOneReunion(id);
  }

  @Post('reuniones')
  async createReunion(
    @Body() dto: CreateReunionComiteDto,
  ): Promise<ResponseReunionComiteDto[]> {
    return this.comitesService.createReunion(dto);
  }

  @Patch('reuniones/:id')
  async updateReunion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReunionComiteDto,
  ): Promise<ResponseReunionComiteDto> {
    return this.comitesService.updateReunion(id, dto);
  }

  @Delete('reuniones/:id')
  async removeReunion(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.comitesService.removeReunion(id);
  }

  // Endpoints para gestión de acuerdos (rutas estáticas antes de :id)
  @Get('acuerdos')
  async findAllAcuerdos(
    @Query('reunion_id') reunionId?: string,
    @Query('comite_id') comiteId?: string,
    @Query('responsable_id') responsableId?: string,
    @Query('estado') estado?: string,
    @Query('tipo_acuerdo') tipoAcuerdo?: string,
    @Query('titulo') titulo?: string,
  ): Promise<ResponseAcuerdoComiteDto[]> {
    return this.comitesService.findAllAcuerdos({
      reunionId,
      comiteId,
      responsableId,
      estado,
      tipoAcuerdo,
      titulo,
    });
  }

  @Get('acuerdos/:id')
  async findOneAcuerdo(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAcuerdoComiteDto> {
    return this.comitesService.findOneAcuerdo(id);
  }

  @Post('acuerdos')
  async createAcuerdo(
    @Body() dto: CreateAcuerdoComiteDto,
  ): Promise<ResponseAcuerdoComiteDto> {
    return this.comitesService.createAcuerdo(dto);
  }

  @Patch('acuerdos/:id')
  async updateAcuerdo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcuerdoComiteDto,
  ): Promise<ResponseAcuerdoComiteDto> {
    return this.comitesService.updateAcuerdo(id, dto);
  }

  @Delete('acuerdos/:id')
  async removeAcuerdo(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.comitesService.removeAcuerdo(id);
  }

  // Rutas dinámicas (:id) después de las rutas estáticas
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseComiteDto> {
    return this.comitesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComiteDto,
  ): Promise<ResponseComiteDto> {
    return this.comitesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.comitesService.remove(id);
  }

  // Endpoints para gestión de miembros
  @Post(':id/miembros')
  async agregarMiembro(
    @Param('id', ParseUUIDPipe) comiteId: string,
    @Body() dto: CreateMiembroComiteDto,
  ): Promise<ResponseMiembroComiteDto> {
    return this.comitesService.agregarMiembro(comiteId, dto);
  }

  @Get(':id/miembros')
  async listarMiembros(
    @Param('id', ParseUUIDPipe) comiteId: string,
  ): Promise<ResponseMiembroComiteDto[]> {
    return this.comitesService.listarMiembros(comiteId);
  }

  @Delete('miembros/:miembroId')
  async quitarMiembro(
    @Param('miembroId', ParseUUIDPipe) miembroId: string,
  ): Promise<void> {
    return this.comitesService.quitarMiembro(miembroId);
  }

  // Endpoints para gestión de documentos
  @Post(':id/documentos')
  async agregarDocumento(
    @Param('id', ParseUUIDPipe) comiteId: string,
    @Body() dto: CreateDocumentoComiteDto,
  ): Promise<ResponseDocumentoComiteDto> {
    return this.comitesService.agregarDocumento(comiteId, dto);
  }

  @Get(':id/documentos')
  async listarDocumentos(
    @Param('id', ParseUUIDPipe) comiteId: string,
  ): Promise<ResponseDocumentoComiteDto[]> {
    return this.comitesService.listarDocumentos(comiteId);
  }
}
