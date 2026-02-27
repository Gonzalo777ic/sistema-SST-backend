import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigEPP } from './entities/config-epp.entity';
import { ResponseConfigEppDto } from './dto/response-config-epp.dto';
import { UpdateConfigEppDto } from './dto/update-config-epp.dto';

@Injectable()
export class ConfigEppService {
  constructor(
    @InjectRepository(ConfigEPP)
    private readonly configRepository: Repository<ConfigEPP>,
  ) {}

  async getConfig(): Promise<ResponseConfigEppDto> {
    let config = await this.configRepository.findOne({ where: {} });
    if (!config) {
      config = this.configRepository.create({
        umbralVigenciaMeses: 6,
        umbralCosto: 50,
      });
      await this.configRepository.save(config);
    }
    return ResponseConfigEppDto.fromEntity(config);
  }

  async updateConfig(dto: UpdateConfigEppDto): Promise<ResponseConfigEppDto> {
    let config = await this.configRepository.findOne({ where: {} });
    if (!config) {
      config = this.configRepository.create({
        umbralVigenciaMeses: dto.umbral_vigencia_meses ?? 6,
        umbralCosto: dto.umbral_costo ?? 50,
      });
    } else {
      if (dto.umbral_vigencia_meses !== undefined) {
        config.umbralVigenciaMeses = dto.umbral_vigencia_meses;
      }
      if (dto.umbral_costo !== undefined) {
        config.umbralCosto = dto.umbral_costo;
      }
      if (dto.whatsapp_numero !== undefined) {
        config.whatsappNumero = dto.whatsapp_numero;
      }
      if (dto.whatsapp_nombre !== undefined) {
        config.whatsappNombre = dto.whatsapp_nombre;
      }
    }
    const saved = await this.configRepository.save(config);
    return ResponseConfigEppDto.fromEntity(saved);
  }

  async getRecomendacionCategoriaCriticidad(
    vigenciaMeses: number,
    costo: number,
  ): Promise<'Core' | 'Recurrente' | 'Indeterminado'> {
    const cfg = await this.getConfig();
    const arribaVigencia = vigenciaMeses >= cfg.umbral_vigencia_meses;
    const arribaCosto = costo >= cfg.umbral_costo;
    if (arribaVigencia && arribaCosto) return 'Core';
    if (!arribaVigencia && !arribaCosto) return 'Recurrente';
    return 'Indeterminado';
  }
}
