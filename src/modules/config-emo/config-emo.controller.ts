import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConfigEmoService } from './config-emo.service';
import { CreatePerfilEmoDto } from './dto/create-perfil-emo.dto';
import { CreateCentroMedicoDto } from './dto/create-centro-medico.dto';
import { CreateResultadoAdicionalDto } from './dto/create-resultado-adicional.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('config-emo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfigEmoController {
  constructor(private readonly configEmoService: ConfigEmoService) {}

  @Get('perfiles')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async findAllPerfiles() {
    return this.configEmoService.findAllPerfiles();
  }

  @Post('perfiles')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async createPerfil(
    @Body() dto: CreatePerfilEmoDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.configEmoService.createPerfil(dto, user.id);
  }

  @Get('perfiles/:id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async findOnePerfil(@Param('id', ParseUUIDPipe) id: string) {
    return this.configEmoService.findOnePerfil(id);
  }

  @Patch('perfiles/:id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async updatePerfil(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { nombre?: string; descripcion?: string; costo_unitario?: number },
  ) {
    return this.configEmoService.updatePerfil(id, dto);
  }

  @Get('centros')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async findAllCentros() {
    return this.configEmoService.findAllCentros();
  }

  @Post('centros')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async createCentro(@Body() dto: CreateCentroMedicoDto) {
    return this.configEmoService.createCentro(dto);
  }

  @Patch('centros/:id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async updateCentro(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCentroMedicoDto>,
  ) {
    return this.configEmoService.updateCentro(id, dto);
  }

  @Delete('centros/:id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async removeCentro(@Param('id', ParseUUIDPipe) id: string) {
    return this.configEmoService.softDeleteCentro(id);
  }

  @Get('resultados')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async findAllResultados() {
    return this.configEmoService.findAllResultados();
  }

  @Post('resultados')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async createResultado(@Body() dto: CreateResultadoAdicionalDto) {
    return this.configEmoService.createResultado(dto);
  }

  @Patch('resultados/:id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async updateResultado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateResultadoAdicionalDto,
  ) {
    return this.configEmoService.updateResultado(id, dto);
  }

  @Delete('resultados/:id')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async removeResultado(@Param('id', ParseUUIDPipe) id: string) {
    return this.configEmoService.softDeleteResultado(id);
  }

  @Get('recomendaciones')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async getRecomendaciones() {
    return { recomendaciones: await this.configEmoService.getRecomendaciones() };
  }

  @Patch('recomendaciones')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async updateRecomendaciones(@Body() body: { recomendaciones: string }) {
    const texto = await this.configEmoService.updateRecomendaciones(
      body.recomendaciones ?? '',
    );
    return { recomendaciones: texto };
  }

  @Get('diferidos')
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA, UsuarioRol.INGENIERO_SST)
  async findAllDiferidos(@Query('q') q?: string) {
    return this.configEmoService.findAllDiferidos(q);
  }
}
