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
import { InspeccionesService } from './inspecciones.service';
import { CreateInspeccionDto } from './dto/create-inspeccion.dto';
import { UpdateInspeccionDto } from './dto/update-inspeccion.dto';
import { ResponseInspeccionDto } from './dto/response-inspeccion.dto';

@Controller('inspecciones')
export class InspeccionesController {
  constructor(private readonly inspeccionesService: InspeccionesService) {}

  @Post()
  async create(@Body() dto: CreateInspeccionDto): Promise<ResponseInspeccionDto> {
    return this.inspeccionesService.create(dto);
  }

  @Get()
  async findAll(@Query('empresa_id') empresaId?: string): Promise<ResponseInspeccionDto[]> {
    return this.inspeccionesService.findAll(empresaId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseInspeccionDto> {
    return this.inspeccionesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspeccionDto,
  ): Promise<ResponseInspeccionDto> {
    return this.inspeccionesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.inspeccionesService.remove(id);
  }
}
