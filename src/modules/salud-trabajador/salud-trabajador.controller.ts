import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';
import { SaludTrabajadorService } from './salud-trabajador.service';
import { UpdateSaludTrabajadorDto } from './dto/update-salud-trabajador.dto';
import { ResponseSaludTrabajadorDto } from './dto/response-salud-trabajador.dto';
import { ResponseHabitoNocivoDto } from './dto/response-habito-nocivo.dto';
import { UpsertHabitoNocivoItemDto } from './dto/upsert-habito-nocivo.dto';

/**
 * Datos de salud del trabajador (Sección IV: Antecedentes Patológicos y Hábitos Nocivos).
 * Confidencialidad médica: solo accesible para el Médico Ocupacional que realiza la Evaluación Clínica.
 * El Centro Médico (laboratorio, técnicos) NO debe ver antecedentes personales; solo sube exámenes auxiliares.
 */
@Controller('trabajadores/:trabajadorId/salud')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UsuarioRol.MEDICO)
export class SaludTrabajadorController {
  constructor(private readonly service: SaludTrabajadorService) {}

  @Get()
  async findAll(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
  ): Promise<{
    antecedentes_patologicos: ResponseSaludTrabajadorDto | null;
    habitos_nocivos: ResponseHabitoNocivoDto[];
  }> {
    return this.service.findAllByTrabajadorId(trabajadorId);
  }

  @Patch('antecedentes')
  async upsertAntecedentes(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Body() dto: UpdateSaludTrabajadorDto,
  ): Promise<ResponseSaludTrabajadorDto> {
    return this.service.upsertSalud(trabajadorId, dto);
  }

  @Post('habitos/upsert-bulk')
  async upsertHabitosBulk(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Body() body: { items: UpsertHabitoNocivoItemDto[] },
  ): Promise<ResponseHabitoNocivoDto[]> {
    return this.service.upsertHabitosBulk(trabajadorId, body.items);
  }
}
