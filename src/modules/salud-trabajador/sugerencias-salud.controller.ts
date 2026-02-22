import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';
import { SaludTrabajadorService } from './salud-trabajador.service';

/**
 * Endpoints de sugerencias para la ficha médica (autocompletado, etc.).
 * Solo accesible para Médico Ocupacional.
 */
@Controller('salud/sugerencias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UsuarioRol.MEDICO)
export class SugerenciasSaludController {
  constructor(private readonly service: SaludTrabajadorService) {}

  @Get('enfermedades-ausentismo')
  async sugerenciasEnfermedadAccidente(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ): Promise<string[]> {
    return this.service.sugerenciasEnfermedadAccidente(q || '', limit ? parseInt(limit, 10) : 20);
  }
}
