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
import { ContratistasService } from './contratistas.service';
import { CreateContratistaDto } from './dto/create-contratista.dto';
import { UpdateContratistaDto } from './dto/update-contratista.dto';
import { ResponseContratistaDto } from './dto/response-contratista.dto';

@Controller('contratistas')
export class ContratistasController {
  constructor(private readonly contratistasService: ContratistasService) {}

  @Post()
  async create(@Body() dto: CreateContratistaDto): Promise<ResponseContratistaDto> {
    return this.contratistasService.create(dto);
  }

  @Get()
  async findAll(@Query('empresa_id') empresaId?: string): Promise<ResponseContratistaDto[]> {
    return this.contratistasService.findAll(empresaId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseContratistaDto> {
    return this.contratistasService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContratistaDto,
  ): Promise<ResponseContratistaDto> {
    return this.contratistasService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.contratistasService.remove(id);
  }
}
