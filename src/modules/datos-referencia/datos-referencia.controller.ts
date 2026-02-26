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
  UseGuards,
} from '@nestjs/common';
import { DatosReferenciaService } from './datos-referencia.service';
import { CreateDatoReferenciaDto } from './dto/create-dato-referencia.dto';
import { UpdateDatoReferenciaDto } from './dto/update-dato-referencia.dto';
import { ResponseDatoReferenciaDto } from './dto/response-dato-referencia.dto';
import { TipoDatoReferencia } from './entities/dato-referencia.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('datos-referencia')
export class DatosReferenciaController {
  constructor(private readonly service: DatosReferenciaService) {}

  @Get()
  async findAll(
    @Query('tipo') tipo?: TipoDatoReferencia,
    @Query('activo') activo?: string,
  ): Promise<ResponseDatoReferenciaDto[]> {
    const activoOnly = activo !== 'false';
    return this.service.findAll(tipo, activoOnly);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDatoReferenciaDto> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async create(@Body() dto: CreateDatoReferenciaDto): Promise<ResponseDatoReferenciaDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDatoReferenciaDto,
  ): Promise<ResponseDatoReferenciaDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
