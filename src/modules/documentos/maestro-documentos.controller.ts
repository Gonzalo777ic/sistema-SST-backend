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
import { MaestroDocumentosService } from './maestro-documentos.service';
import { CreateMaestroDocumentoDto } from './dto/create-maestro-documento.dto';
import { UpdateMaestroDocumentoDto } from './dto/update-maestro-documento.dto';
import { ResponseMaestroDocumentoDto } from './dto/response-maestro-documento.dto';

@Controller('maestro-documentos')
export class MaestroDocumentosController {
  constructor(private readonly maestroDocumentosService: MaestroDocumentosService) {}

  @Post()
  async create(@Body() dto: CreateMaestroDocumentoDto): Promise<ResponseMaestroDocumentoDto> {
    return this.maestroDocumentosService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('nombre') nombre?: string,
    @Query('proceso') proceso?: string,
  ): Promise<ResponseMaestroDocumentoDto[]> {
    return this.maestroDocumentosService.findAll(empresaId, nombre, proceso);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseMaestroDocumentoDto> {
    return this.maestroDocumentosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaestroDocumentoDto,
  ): Promise<ResponseMaestroDocumentoDto> {
    return this.maestroDocumentosService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.maestroDocumentosService.remove(id);
  }
}
