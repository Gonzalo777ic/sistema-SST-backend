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
} from '@nestjs/common';
import { AtsService } from './ats.service';
import { CreateAtsDto } from './dto/create-ats.dto';
import { UpdateAtsDto } from './dto/update-ats.dto';
import { ResponseAtsDto } from './dto/response-ats.dto';

@Controller('ats')
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  @Post()
  async create(@Body() dto: CreateAtsDto): Promise<ResponseAtsDto> {
    return this.atsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponseAtsDto[]> {
    return this.atsService.findAll(empresaId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAtsDto> {
    return this.atsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAtsDto,
  ): Promise<ResponseAtsDto> {
    return this.atsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.atsService.remove(id);
  }
}
