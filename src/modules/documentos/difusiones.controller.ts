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
import { DifusionesService } from './difusiones.service';
import { CreateDifusionDocumentoDto } from './dto/create-difusion-documento.dto';
import { UpdateDifusionDocumentoDto } from './dto/update-difusion-documento.dto';
import { ResponseDifusionDocumentoDto } from './dto/response-difusion-documento.dto';
import { EstadoDifusion } from './entities/difusion-documento.entity';

@Controller('documentos/difusiones')
export class DifusionesController {
  constructor(private readonly difusionesService: DifusionesService) {}

  @Post()
  async create(
    @Body() dto: CreateDifusionDocumentoDto,
  ): Promise<ResponseDifusionDocumentoDto> {
    return this.difusionesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('estado') estado?: EstadoDifusion,
    @Query('documento_id') documentoId?: string,
  ): Promise<ResponseDifusionDocumentoDto[]> {
    return this.difusionesService.findAll(empresaId, estado, documentoId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDifusionDocumentoDto> {
    return this.difusionesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDifusionDocumentoDto,
  ): Promise<ResponseDifusionDocumentoDto> {
    return this.difusionesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.difusionesService.remove(id);
  }
}
