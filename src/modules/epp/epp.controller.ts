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
import { EppService } from './epp.service';
import { CreateSolicitudEppDto } from './dto/create-solicitud-epp.dto';
import { UpdateSolicitudEppDto } from './dto/update-solicitud-epp.dto';
import { ResponseSolicitudEppDto } from './dto/response-solicitud-epp.dto';
import { EstadoSolicitudEPP } from './entities/solicitud-epp.entity';

@Controller('epp')
export class EppController {
  constructor(private readonly eppService: EppService) {}

  @Post('solicitudes')
  async create(@Body() dto: CreateSolicitudEppDto): Promise<ResponseSolicitudEppDto> {
    return this.eppService.create(dto);
  }

  @Get('solicitudes')
  async findAll(
    @Query('empresa_id') empresaId?: string,
    @Query('trabajador_id') trabajadorId?: string,
    @Query('estado') estado?: EstadoSolicitudEPP,
  ): Promise<ResponseSolicitudEppDto[]> {
    return this.eppService.findAll(empresaId, trabajadorId, estado);
  }

  @Get('solicitudes/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolicitudEppDto> {
    return this.eppService.findOne(id);
  }

  @Patch('solicitudes/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSolicitudEppDto,
  ): Promise<ResponseSolicitudEppDto> {
    return this.eppService.update(id, dto);
  }

  @Delete('solicitudes/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.eppService.remove(id);
  }
}
