import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { CreateAreaDto } from './dto/create-area.dto';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  async create(@Body() dto: CreateEmpresaDto): Promise<ResponseEmpresaDto> {
    return this.empresasService.create(dto);
  }

  @Get()
  async findAll(): Promise<ResponseEmpresaDto[]> {
    return this.empresasService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresasService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.empresasService.remove(id);
  }

  @Get(':empresaId/areas')
  async findAreas(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ): Promise<{ id: string; nombre: string }[]> {
    return this.empresasService.findAreasByEmpresa(empresaId);
  }

  @Post(':empresaId/areas')
  async createArea(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateAreaDto,
  ): Promise<{ id: string; nombre: string }> {
    return this.empresasService.createArea(empresaId, dto);
  }
}
