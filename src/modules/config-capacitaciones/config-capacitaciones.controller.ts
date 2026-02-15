import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ConfigCapacitacionesService } from './config-capacitaciones.service';
import { ResponseConfigCapacitacionDto } from './dto/response-config-capacitacion.dto';
import { UpdateConfigCapacitacionDto } from './dto/update-config-capacitacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('config-capacitaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfigCapacitacionesController {
  constructor(private readonly configService: ConfigCapacitacionesService) {}

  @Get()
  async getConfig(): Promise<ResponseConfigCapacitacionDto> {
    return this.configService.getConfig();
  }

  @Patch()
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async updateConfig(@Body() dto: UpdateConfigCapacitacionDto): Promise<ResponseConfigCapacitacionDto> {
    return this.configService.updateConfig(dto);
  }
}
