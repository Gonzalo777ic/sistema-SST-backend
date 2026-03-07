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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrabajadoresService } from './trabajadores.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto, UpdatePersonalDataDto, UpdateMedicoPersonalDataDto } from './dto/update-trabajador.dto';
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto';
import { ProcesarImportacionDto } from './dto/procesar-importacion.dto';

@Controller('trabajadores')
export class TrabajadoresController {
  constructor(private readonly trabajadoresService: TrabajadoresService) {}

  @Post()
  async create(@Body() dto: CreateTrabajadorDto): Promise<ResponseTrabajadorDto> {
    return this.trabajadoresService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponseTrabajadorDto[]> {
    return this.trabajadoresService.findAll(empresaId);
  }

  @Get('buscar')
  async buscarPorDni(@Query('dni') dni: string): Promise<ResponseTrabajadorDto | null> {
    if (!dni) {
      throw new BadRequestException('El parámetro DNI es requerido');
    }
    return this.trabajadoresService.buscarPorDni(dni);
  }

  @Get('search')
  async buscar(
    @Query('empresa_id') empresaId?: string,
    @Query('q') q?: string,
  ): Promise<ResponseTrabajadorDto[]> {
    return this.trabajadoresService.buscar(empresaId || undefined, q || '');
  }

  @Get('para-comite')
  async findParaComite(@Query('empresa_id') empresaId: string): Promise<ResponseTrabajadorDto[]> {
    if (!empresaId) {
      throw new BadRequestException('El parámetro empresa_id es requerido');
    }
    return this.trabajadoresService.findParaComite(empresaId);
  }

  @Post('validar-importacion')
  @UseInterceptors(FileInterceptor('file'))
  async validarImportacion(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe subir un archivo Excel o CSV');
    }
    return this.trabajadoresService.validarImportacion(file);
  }

  @Post('procesar-importacion')
  async procesarImportacion(@Body() dto: ProcesarImportacionDto) {
    return this.trabajadoresService.procesarImportacion(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTrabajadorDto> {
    return this.trabajadoresService.findOne(id);
  }

  @Post(':id/upload-foto')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Debe seleccionar un archivo de imagen');
    }
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.mimetype)) {
      throw new BadRequestException('El archivo debe ser una imagen (JPEG, PNG, WebP o GIF)');
    }
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      throw new BadRequestException('La imagen no debe superar 2 MB');
    }
    const url = await this.trabajadoresService.uploadFoto(id, file.buffer, file.mimetype);
    return { url };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrabajadorDto,
  ): Promise<ResponseTrabajadorDto> {
    return this.trabajadoresService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.trabajadoresService.remove(id);
  }

  @Patch(':id/personal-data')
  async updatePersonalData(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonalDataDto,
  ): Promise<ResponseTrabajadorDto> {
    return this.trabajadoresService.updatePersonalData(id, dto);
  }

  @Patch(':id/medico-personal-data')
  async updateMedicoPersonalData(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicoPersonalDataDto,
  ): Promise<ResponseTrabajadorDto> {
    return this.trabajadoresService.updateMedicoPersonalData(id, dto);
  }
}
