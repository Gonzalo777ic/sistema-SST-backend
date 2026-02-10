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
} from '@nestjs/common';
import { TrabajadoresService } from './trabajadores.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto, UpdatePersonalDataDto } from './dto/update-trabajador.dto';
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto';

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

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTrabajadorDto> {
    return this.trabajadoresService.findOne(id);
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
}
