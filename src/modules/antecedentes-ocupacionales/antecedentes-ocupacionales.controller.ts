import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AntecedentesOcupacionalesService } from './antecedentes-ocupacionales.service';
import { CreateAntecedenteOcupacionalDto } from './dto/create-antecedente-ocupacional.dto';
import { UpdateAntecedenteOcupacionalDto } from './dto/update-antecedente-ocupacional.dto';
import { ResponseAntecedenteOcupacionalDto } from './dto/response-antecedente-ocupacional.dto';

@Controller('trabajadores/:trabajadorId/antecedentes-ocupacionales')
export class AntecedentesOcupacionalesController {
  constructor(private readonly service: AntecedentesOcupacionalesService) {}

  @Get()
  async findAll(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
  ): Promise<ResponseAntecedenteOcupacionalDto[]> {
    return this.service.findByTrabajadorId(trabajadorId);
  }

  @Post()
  async create(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Body() dto: CreateAntecedenteOcupacionalDto,
  ): Promise<ResponseAntecedenteOcupacionalDto> {
    return this.service.create(trabajadorId, dto);
  }

  @Patch(':id')
  async update(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAntecedenteOcupacionalDto,
  ): Promise<ResponseAntecedenteOcupacionalDto> {
    return this.service.update(trabajadorId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.service.remove(trabajadorId, id);
  }

  @Post('upsert-bulk')
  async upsertBulk(
    @Param('trabajadorId', ParseUUIDPipe) trabajadorId: string,
    @Body()
    body: {
      items: Array<{
        id?: string;
        empresa: string;
        area_trabajo?: string;
        ocupacion: string;
        fecha_inicio: string;
        fecha_fin?: string;
        riesgos?: string;
        epp_utilizado?: string;
      }>;
    },
  ): Promise<ResponseAntecedenteOcupacionalDto[]> {
    return this.service.upsertBulk(trabajadorId, body.items);
  }
}
