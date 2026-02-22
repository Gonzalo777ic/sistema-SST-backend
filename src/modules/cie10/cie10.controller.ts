import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Cie10Service } from './cie10.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('cie10')
@UseGuards(JwtAuthGuard)
export class Cie10Controller {
  constructor(private readonly cie10Service: Cie10Service) {}

  @Get()
  async search(@Query('q') q: string) {
    return this.cie10Service.search(q || '', 20);
  }

  @Get('linaje')
  async getLinaje(@Query('code') code: string) {
    return this.cie10Service.getLinaje(code || '');
  }
}
