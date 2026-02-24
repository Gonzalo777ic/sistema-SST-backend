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
import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { ResponseCargoDto } from './dto/response-cargo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('cargos')
@UseGuards(JwtAuthGuard)
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  async findAll(
    @Query('activo') activo?: string,
  ): Promise<ResponseCargoDto[]> {
    const activoOnly = activo !== 'false';
    return this.cargosService.findAll(activoOnly);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCargoDto> {
    return this.cargosService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async create(@Body() dto: CreateCargoDto): Promise<ResponseCargoDto> {
    return this.cargosService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCargoDto,
  ): Promise<ResponseCargoDto> {
    return this.cargosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cargosService.remove(id);
  }
}
