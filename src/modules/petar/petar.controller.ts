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
import { PetarService } from './petar.service';
import { CreatePetarDto } from './dto/create-petar.dto';
import { UpdatePetarDto } from './dto/update-petar.dto';
import { ResponsePetarDto } from './dto/response-petar.dto';

@Controller('petar')
export class PetarController {
  constructor(private readonly petarService: PetarService) {}

  @Post()
  async create(@Body() dto: CreatePetarDto): Promise<ResponsePetarDto> {
    return this.petarService.create(dto);
  }

  @Get()
  async findAll(
    @Query('empresa_id') empresaId?: string,
  ): Promise<ResponsePetarDto[]> {
    return this.petarService.findAll(empresaId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePetarDto> {
    return this.petarService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePetarDto,
  ): Promise<ResponsePetarDto> {
    return this.petarService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.petarService.remove(id);
  }
}
