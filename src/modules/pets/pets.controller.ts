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
import { PetsService } from './pets.service';
import { CreatePetsDto } from './dto/create-pets.dto';
import { UpdatePetsDto } from './dto/update-pets.dto';
import { ResponsePetsDto } from './dto/response-pets.dto';
import { EstadoPETS } from './entities/pets.entity';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  async create(@Body() dto: CreatePetsDto): Promise<ResponsePetsDto> {
    return this.petsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('estado') estado?: EstadoPETS,
  ): Promise<ResponsePetsDto[]> {
    return this.petsService.findAll(empresaId, estado);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponsePetsDto> {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePetsDto,
  ): Promise<ResponsePetsDto> {
    return this.petsService.update(id, dto);
  }

  @Post(':codigo/nueva-version')
  async crearNuevaVersion(@Param('codigo') codigo: string): Promise<ResponsePetsDto> {
    return this.petsService.crearNuevaVersion(codigo);
  }

  @Post(':id/lectura')
  async registrarLectura(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { usuario_id: string; usuario_nombre: string },
  ): Promise<void> {
    return this.petsService.registrarLectura(id, body.usuario_id, body.usuario_nombre);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.petsService.remove(id);
  }
}
