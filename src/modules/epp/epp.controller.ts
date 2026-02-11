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
} from '@nestjs/common';
import { EppService } from './epp.service';
import { CreateSolicitudEppDto } from './dto/create-solicitud-epp.dto';
import { UpdateSolicitudEppDto } from './dto/update-solicitud-epp.dto';
import { ResponseSolicitudEppDto } from './dto/response-solicitud-epp.dto';
import { CreateEppDto } from './dto/create-epp.dto';
import { UpdateEppDto } from './dto/update-epp.dto';
import { ResponseEppDto } from './dto/response-epp.dto';
import { EstadoSolicitudEPP } from './entities/solicitud-epp.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('epp')
@UseGuards(JwtAuthGuard)
export class EppController {
  constructor(private readonly eppService: EppService) {}

  // ========== CRUD EPP (Catálogo) ==========

  @Post('catalogo')
  async createEpp(@Body() dto: CreateEppDto): Promise<ResponseEppDto> {
    return this.eppService.createEpp(dto);
  }

  @Get('catalogo')
  async findAllEpp(
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponseEppDto[]> {
    return this.eppService.findAllEpp(empresaId);
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
}
