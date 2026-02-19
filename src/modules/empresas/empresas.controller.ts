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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmpresasService } from './empresas.service';
import { FirmasGerenteService } from './firmas-gerente.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { CreateFirmaGerenteDto } from './dto/create-firma-gerente.dto';
import { UpdateFirmaGerenteDto } from './dto/update-firma-gerente.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { CreateGerenciaDto } from './dto/create-gerencia.dto';
import { UpdateGerenciaDto } from './dto/update-gerencia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Controller('empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    private readonly firmasGerenteService: FirmasGerenteService,
  ) {}

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Body('ruc') ruc: string,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Debe seleccionar un archivo de imagen');
    }
    if (!ruc || ruc.length !== 11 || !/^\d{11}$/.test(ruc)) {
      throw new BadRequestException('El RUC debe tener 11 dígitos numéricos');
    }
    const url = await this.empresasService.uploadLogo(ruc, file.buffer, file.mimetype);
    return { url };
  }

  @Post()
  async create(@Body() dto: CreateEmpresaDto): Promise<ResponseEmpresaDto> {
    return this.empresasService.create(dto);
  }

  @Get()
  async findAll(): Promise<ResponseEmpresaDto[]> {
    return this.empresasService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresasService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.empresasService.remove(id);
  }

  @Get(':empresaId/areas')
  async findAreas(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ): Promise<{ id: string; nombre: string }[]> {
    return this.empresasService.findAreasByEmpresa(empresaId);
  }

  @Post(':empresaId/areas')
  async createArea(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateAreaDto,
  ): Promise<{ id: string; nombre: string }> {
    return this.empresasService.createArea(empresaId, dto);
  }

  // --- Unidades ---
  @Get(':empresaId/unidades')
  async findUnidades(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    return this.empresasService.findUnidadesByEmpresa(empresaId);
  }

  @Post(':empresaId/unidades')
  async createUnidad(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: Omit<CreateUnidadDto, 'empresa_id'>,
  ) {
    return this.empresasService.createUnidad(empresaId, dto);
  }

  @Patch(':empresaId/unidades/:id')
  async updateUnidad(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnidadDto,
  ) {
    return this.empresasService.updateUnidad(empresaId, id, dto);
  }

  @Delete(':empresaId/unidades/:id')
  async removeUnidad(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.empresasService.removeUnidad(empresaId, id);
  }

  // --- Sedes ---
  @Get(':empresaId/sedes')
  async findSedes(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    return this.empresasService.findSedesByEmpresa(empresaId);
  }

  @Post(':empresaId/sedes')
  async createSede(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: Omit<CreateSedeDto, 'empresa_id'>,
  ) {
    return this.empresasService.createSede(empresaId, dto);
  }

  @Patch(':empresaId/sedes/:id')
  async updateSede(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSedeDto,
  ) {
    return this.empresasService.updateSede(empresaId, id, dto);
  }

  @Delete(':empresaId/sedes/:id')
  async removeSede(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.empresasService.removeSede(empresaId, id);
  }

  // --- Gerencias ---
  @Get(':empresaId/gerencias')
  async findGerencias(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    return this.empresasService.findGerenciasByEmpresa(empresaId);
  }

  @Post(':empresaId/gerencias')
  async createGerencia(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: Omit<CreateGerenciaDto, 'empresa_id'>,
  ) {
    return this.empresasService.createGerencia(empresaId, dto);
  }

  @Patch(':empresaId/gerencias/:id')
  async updateGerencia(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGerenciaDto,
  ) {
    return this.empresasService.updateGerencia(empresaId, id, dto);
  }

  @Delete(':empresaId/gerencias/:id')
  async removeGerencia(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.empresasService.removeGerencia(empresaId, id);
  }

  @Get(':empresaId/gerentes/candidatos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async buscarCandidatosGerente(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Query('q') q?: string,
  ) {
    return this.firmasGerenteService.buscarCandidatos(empresaId, q || '');
  }

  @Get(':empresaId/gerentes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async listarGerentes(@Param('empresaId', ParseUUIDPipe) empresaId: string) {
    return this.firmasGerenteService.findByEmpresa(empresaId);
  }

  @Post('gerentes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async crearGerente(@Body() dto: CreateFirmaGerenteDto) {
    return this.firmasGerenteService.create(dto);
  }

  @Patch('gerentes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async actualizarGerente(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFirmaGerenteDto,
  ) {
    return this.firmasGerenteService.update(id, dto);
  }

  @Patch('gerentes/:id/desactivar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async desactivarGerente(@Param('id', ParseUUIDPipe) id: string) {
    return this.firmasGerenteService.desactivar(id);
  }

  @Patch('gerentes/:id/reactivar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN, UsuarioRol.ADMIN_EMPRESA)
  async reactivarGerente(@Param('id', ParseUUIDPipe) id: string) {
    return this.firmasGerenteService.reactivar(id);
  }
}
