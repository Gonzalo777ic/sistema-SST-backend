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
import { RiesgosService } from './riesgos.service';
import { CreateEvaluacionRiesgoDto } from './dto/create-evaluacion-riesgo.dto';
import { UpdateEvaluacionRiesgoDto } from './dto/update-evaluacion-riesgo.dto';
import { ResponseEvaluacionRiesgoDto } from './dto/response-evaluacion-riesgo.dto';

@Controller('riesgos')
export class RiesgosController {
  constructor(private readonly riesgosService: RiesgosService) {}

  @Post()
  async create(@Body() dto: CreateEvaluacionRiesgoDto): Promise<ResponseEvaluacionRiesgoDto> {
    return this.riesgosService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('area_id') areaId?: string,
  ): Promise<ResponseEvaluacionRiesgoDto[]> {
    return this.riesgosService.findAll(empresaId, areaId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEvaluacionRiesgoDto> {
    return this.riesgosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEvaluacionRiesgoDto,
  ): Promise<ResponseEvaluacionRiesgoDto> {
    return this.riesgosService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.riesgosService.remove(id);
  }
}
