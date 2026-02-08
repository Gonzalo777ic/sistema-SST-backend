import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsuarioRol } from './entities/usuario.entity';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(UsuarioRol.SUPER_ADMIN)
  async create(@Body() dto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    return this.usuariosService.create(dto);
  }

  @Get()
  @Roles(UsuarioRol.SUPER_ADMIN)
  async findAll(): Promise<ResponseUsuarioDto[]> {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles(UsuarioRol.SUPER_ADMIN)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(UsuarioRol.SUPER_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() currentUser: { id: string; dni: string; roles: UsuarioRol[] },
  ): Promise<ResponseUsuarioDto> {
    return this.usuariosService.update(id, dto, currentUser.id);
  }

  @Post(':id/change-password')
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { nueva_password: string; confirmacion_password: string },
  ): Promise<void> {
    return this.usuariosService.changePassword(id, dto.nueva_password);
  }

  @Post(':id/reset-password')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.usuariosService.resetPassword(id);
  }
}
