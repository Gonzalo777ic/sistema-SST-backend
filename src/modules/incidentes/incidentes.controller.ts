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
} from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { ResponseIncidenteDto } from './dto/response-incidente.dto';
import { SeveridadIncidente, TipoIncidente, EstadoIncidente } from './entities/incidente.entity';

@Controller('incidentes')
export class IncidentesController {
  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  async create(@Body() dto: CreateIncidenteDto): Promise<ResponseIncidenteDto> {
    return this.incidentesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('severidad') severidad?: SeveridadIncidente,
    @Query('tipo') tipo?: TipoIncidente,
    @Query('estado') estado?: EstadoIncidente,
    @Query('search') search?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
    @Query('unidad') unidad?: string,
    @Query('area_id') areaId?: string,
    @Query('sede') sede?: string,
  ): Promise<ResponseIncidenteDto[]> {
    return this.incidentesService.findAll(
      empresaId,
      severidad,
      search,
      tipo,
      estado,
      fechaDesde,
      fechaHasta,
      unidad,
      areaId,
      sede,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseIncidenteDto> {
    return this.incidentesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidenteDto,
  ): Promise<ResponseIncidenteDto> {
    return this.incidentesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.incidentesService.remove(id);
  }
}
