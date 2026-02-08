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
import { IpercService } from './iperc.service';
import { CreateIpercDto } from './dto/create-iperc.dto';
import { UpdateIpercDto } from './dto/update-iperc.dto';
import { ResponseIpercDto } from './dto/response-iperc.dto';

@Controller('iperc')
export class IpercController {
  constructor(private readonly ipercService: IpercService) {}

  @Post()
  async create(@Body() dto: CreateIpercDto): Promise<ResponseIpercDto> {
    return this.ipercService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponseIpercDto[]> {
    return this.ipercService.findAll(empresaId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseIpercDto> {
    return this.ipercService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIpercDto,
  ): Promise<ResponseIpercDto> {
    return this.ipercService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ipercService.remove(id);
  }
}
