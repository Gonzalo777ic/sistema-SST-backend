import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { ConfigEppService } from './config-epp.service';
import { ResponseConfigEppDto } from './dto/response-config-epp.dto';
import { UpdateConfigEppDto } from './dto/update-config-epp.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('config-epp')
@UseGuards(JwtAuthGuard)
export class ConfigEppController {
  constructor(private readonly configEppService: ConfigEppService) {}

  @Get()
  async getConfig(): Promise<ResponseConfigEppDto> {
    return this.configEppService.getConfig();
  }

  @Get('recomendacion')
  async getRecomendacion(
    @Query('vigencia_meses') vigenciaMeses: string,
    @Query('costo') costo: string,
  ): Promise<{ recomendacion: 'Core' | 'Recurrente' | 'Indeterminado' }> {
    const vigencia = parseInt(vigenciaMeses || '0', 10);
    const cost = parseFloat(costo || '0');
    const recomendacion = await this.configEppService.getRecomendacionCategoriaCriticidad(
      vigencia,
      cost,
    );
    return { recomendacion };
  }

  @Patch()
  async updateConfig(@Body() dto: UpdateConfigEppDto): Promise<ResponseConfigEppDto> {
    return this.configEppService.updateConfig(dto);
  }
}
