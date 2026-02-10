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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AccionesCorrectivasService } from './acciones-correctivas.service';
import { CreateAccionCorrectivaDto } from './dto/create-accion-correctiva.dto';
import { UpdateAccionCorrectivaDto } from './dto/update-accion-correctiva.dto';
import { ResponseAccionCorrectivaDto, AccionesKPIsDto } from './dto/response-accion-correctiva.dto';
import { FuenteAccion, EstadoAccion } from './entities/accion-correctiva.entity';

@Controller('acciones-correctivas')
export class AccionesCorrectivasController {
  constructor(
    private readonly accionesCorrectivasService: AccionesCorrectivasService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateAccionCorrectivaDto,
  ): Promise<ResponseAccionCorrectivaDto> {
    return this.accionesCorrectivasService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('fuente') fuente?: FuenteAccion,
    @Query('estado') estado?: EstadoAccion,
    @Query('responsable') responsableNombre?: string,
    @Query('titulo') titulo?: string,
    @Query('unidad') unidad?: string,
    @Query('area_id') areaId?: string,
    @Query('sede') sede?: string,
    @Query('contratista_id') contratistaId?: string,
    @Query('fecha_programada_desde') fechaProgramadaDesde?: string,
    @Query('fecha_programada_hasta') fechaProgramadaHasta?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ): Promise<{
    data: ResponseAccionCorrectivaDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.accionesCorrectivasService.findAll(
      empresaId,
      fuente,
      estado,
      responsableNombre,
      titulo,
      unidad,
      areaId,
      sede,
      contratistaId,
      fechaProgramadaDesde,
      fechaProgramadaHasta,
      page,
      limit,
    );
  }

  @Get('kpis')
  async getKPIs(@Query('empresa_id') empresaId?: string): Promise<AccionesKPIsDto> {
    return this.accionesCorrectivasService.getKPIs(empresaId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAccionCorrectivaDto> {
    return this.accionesCorrectivasService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccionCorrectivaDto,
  ): Promise<ResponseAccionCorrectivaDto> {
    return this.accionesCorrectivasService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.accionesCorrectivasService.remove(id);
  }
}
