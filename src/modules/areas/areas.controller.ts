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
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { ResponseAreaDto } from './dto/response-area.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('areas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async create(@Body() dto: CreateAreaDto): Promise<ResponseAreaDto> {
    return this.areasService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponseAreaDto[]> {
    return this.areasService.findAll(empresaId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAreaDto> {
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAreaDto,
  ): Promise<ResponseAreaDto> {
    return this.areasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.areasService.remove(id);
  }
}
