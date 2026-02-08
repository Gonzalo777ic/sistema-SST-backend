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
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { ResponseCapacitacionDto } from './dto/response-capacitacion.dto';
import { CreateExamenCapacitacionDto } from './dto/create-examen-capacitacion.dto';
import { CreateResultadoExamenDto } from './dto/create-resultado-examen.dto';

@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

  @Post()
  async create(@Body() dto: CreateCapacitacionDto): Promise<ResponseCapacitacionDto> {
    return this.capacitacionesService.create(dto);
  }

  @Get()
  async findAll(@Query('empresa_id') empresaId?: string): Promise<ResponseCapacitacionDto[]> {
    return this.capacitacionesService.findAll(empresaId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseCapacitacionDto> {
    return this.capacitacionesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCapacitacionDto,
  ): Promise<ResponseCapacitacionDto> {
    return this.capacitacionesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.capacitacionesService.remove(id);
  }

  @Post(':id/examenes')
  async crearExamen(
    @Param('id', ParseUUIDPipe) capacitacionId: string,
    @Body() dto: CreateExamenCapacitacionDto,
  ) {
    return this.capacitacionesService.crearExamen({
      ...dto,
      capacitacion_id: capacitacionId,
    });
  }

  @Post('examenes/rendir')
  async rendirExamen(@Body() dto: CreateResultadoExamenDto) {
    return this.capacitacionesService.rendirExamen(dto);
  }
}
