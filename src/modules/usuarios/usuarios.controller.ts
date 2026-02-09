import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
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
  async create(
    @Body() dto: CreateUsuarioDto,
    @CurrentUser() currentUser: { id: string; dni: string; roles: UsuarioRol[]; empresaId?: string | null },
  ): Promise<ResponseUsuarioDto> {
    // Solo SUPER_ADMIN puede crear usuarios desde este endpoint
    // ADMIN_EMPRESA no puede crear usuarios aquí (debe usar el flujo de Trabajadores)
    return this.usuariosService.create(dto, currentUser);
  }

  @Get()
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async findAll(
    @CurrentUser() currentUser: { id: string; dni: string; roles: UsuarioRol[]; empresaId?: string | null },
  ): Promise<ResponseUsuarioDto[]> {
    return this.usuariosService.findAll(
      currentUser.id,
      currentUser.roles,
      currentUser.empresaId || null,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: { id: string; dni: string; roles: UsuarioRol[]; empresaId?: string | null },
  ): Promise<ResponseUsuarioDto> {
    // Permitir que cualquier usuario pueda consultar su propio perfil
    if (id === currentUser.id) {
      return this.usuariosService.findOne(id);
    }
    
    // Para otros usuarios, verificar permisos
    const isSuperAdmin = currentUser.roles.includes(UsuarioRol.SUPER_ADMIN);
    const isAdminEmpresa = currentUser.roles.includes(UsuarioRol.ADMIN_EMPRESA);
    
    if (!isSuperAdmin && !isAdminEmpresa) {
      throw new ForbiddenException('No tienes permisos para acceder a este perfil');
    }
    
    // ADMIN_EMPRESA solo puede ver usuarios de su empresa
    if (isAdminEmpresa && !isSuperAdmin) {
      const usuario = await this.usuariosService.findOne(id);
      if (usuario.empresaId !== currentUser.empresaId) {
        throw new ForbiddenException('No tienes permisos para acceder a usuarios de otras empresas');
      }
    }
    
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() currentUser: { id: string; dni: string; roles: UsuarioRol[]; empresaId?: string | null },
  ): Promise<ResponseUsuarioDto> {
    // ADMIN_EMPRESA no puede modificar roles ni activar/desactivar usuarios (excepto para sí mismo)
    const isAdminEmpresa = currentUser.roles.includes(UsuarioRol.ADMIN_EMPRESA) && !currentUser.roles.includes(UsuarioRol.SUPER_ADMIN);
    if (isAdminEmpresa && id !== currentUser.id) {
      if (dto.roles !== undefined || dto.activo !== undefined) {
        throw new ForbiddenException('No tienes permisos para modificar roles o estado de otros usuarios');
      }
    }
    
    return this.usuariosService.update(
      id,
      dto,
      currentUser.id,
      currentUser.roles,
      currentUser.empresaId || null,
    );
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
