import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { CreateAreaDto } from './dto/create-area.dto';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Body('ruc') ruc: string,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Debe seleccionar un archivo de imagen');
    }
    if (!ruc || ruc.length !== 11 || !/^\d{11}$/.test(ruc)) {
      throw new BadRequestException('El RUC debe tener 11 dígitos numéricos');
    }
    const url = await this.empresasService.uploadLogo(ruc, file.buffer, file.mimetype);
    return { url };
  }

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
