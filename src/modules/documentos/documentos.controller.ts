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
  ParseBoolPipe,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoSstDto } from './dto/create-documento-sst.dto';
import { UpdateDocumentoSstDto } from './dto/update-documento-sst.dto';
import { ResponseDocumentoSstDto } from './dto/response-documento-sst.dto';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  async create(@Body() dto: CreateDocumentoSstDto): Promise<ResponseDocumentoSstDto> {
    return this.documentosService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('activo') activo?: string,
    @Query('categoria') categoria?: string,
  ): Promise<ResponseDocumentoSstDto[]> {
    const activoBool = activo === 'true' ? true : activo === 'false' ? false : undefined;
    return this.documentosService.findAll(empresaId, activoBool, categoria);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDocumentoSstDto> {
    return this.documentosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentoSstDto,
  ): Promise<ResponseDocumentoSstDto> {
    return this.documentosService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.documentosService.remove(id);
  }
}
