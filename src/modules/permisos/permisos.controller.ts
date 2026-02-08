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
import { PermisosService } from './permisos.service';
import { CreatePermisoTrabajoDto } from './dto/create-permiso-trabajo.dto';
import { UpdatePermisoTrabajoDto } from './dto/update-permiso-trabajo.dto';
import { ResponsePermisoTrabajoDto } from './dto/response-permiso-trabajo.dto';
import { EstadoPermiso } from './entities/permiso-trabajo.entity';

@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Post()
  async create(@Body() dto: CreatePermisoTrabajoDto): Promise<ResponsePermisoTrabajoDto> {
    return this.permisosService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('trabajador_id') trabajadorId?: string,
    @Query('estado') estado?: EstadoPermiso,
  ): Promise<ResponsePermisoTrabajoDto[]> {
    return this.permisosService.findAll(empresaId, trabajadorId, estado);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePermisoTrabajoDto> {
    return this.permisosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermisoTrabajoDto,
  ): Promise<ResponsePermisoTrabajoDto> {
    return this.permisosService.update(id, dto);
  }

  @Post(':id/confirmar-lectura')
  async confirmarLectura(
    @Param('id', ParseUUIDPipe) permisoId: string,
    @Body() body: { trabajador_id: string; firma_url?: string },
  ): Promise<void> {
    return this.permisosService.confirmarLectura(
      permisoId,
      body.trabajador_id,
      body.firma_url,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.permisosService.remove(id);
  }
}
