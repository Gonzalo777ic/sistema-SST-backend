import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaestroDocumento } from './entities/maestro-documento.entity';
import { CreateMaestroDocumentoDto } from './dto/create-maestro-documento.dto';
import { UpdateMaestroDocumentoDto } from './dto/update-maestro-documento.dto';
import { ResponseMaestroDocumentoDto } from './dto/response-maestro-documento.dto';

@Injectable()
export class MaestroDocumentosService {
  constructor(
    @InjectRepository(MaestroDocumento)
    private readonly maestroDocumentoRepository: Repository<MaestroDocumento>,
  ) {}

  async create(dto: CreateMaestroDocumentoDto): Promise<ResponseMaestroDocumentoDto> {
    const entity = this.maestroDocumentoRepository.create({
      nombre: dto.nombre,
      proceso: dto.proceso,
      subproceso: dto.subproceso,
      empresaId: dto.empresa_id,
    });
    const saved = await this.maestroDocumentoRepository.save(entity);
    return ResponseMaestroDocumentoDto.fromEntity(saved);
  }

  async findAll(
    empresaId?: string,
    nombre?: string,
    proceso?: string,
  ): Promise<ResponseMaestroDocumentoDto[]> {
    const qb = this.maestroDocumentoRepository
      .createQueryBuilder('md')
      .orderBy('md.nombre', 'ASC');

    if (empresaId) {
      qb.andWhere('md.empresa_id = :empresaId', { empresaId });
    }
    if (nombre?.trim()) {
      qb.andWhere('LOWER(md.nombre) LIKE LOWER(:nombre)', {
        nombre: `%${nombre.trim()}%`,
      });
    }
    if (proceso?.trim()) {
      qb.andWhere('LOWER(md.proceso) LIKE LOWER(:proceso)', {
        proceso: `%${proceso.trim()}%`,
      });
    }

    const entities = await qb.getMany();
    return entities.map((e) => ResponseMaestroDocumentoDto.fromEntity(e));
  }

  async findOne(id: string): Promise<ResponseMaestroDocumentoDto> {
    const entity = await this.maestroDocumentoRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`Maestro documento con ID ${id} no encontrado`);
    }
    return ResponseMaestroDocumentoDto.fromEntity(entity);
  }

  async update(
    id: string,
    dto: UpdateMaestroDocumentoDto,
  ): Promise<ResponseMaestroDocumentoDto> {
    const entity = await this.maestroDocumentoRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException(`Maestro documento con ID ${id} no encontrado`);
    }
    if (dto.nombre !== undefined) entity.nombre = dto.nombre;
    if (dto.proceso !== undefined) entity.proceso = dto.proceso;
    if (dto.subproceso !== undefined) entity.subproceso = dto.subproceso;
    const saved = await this.maestroDocumentoRepository.save(entity);
    return ResponseMaestroDocumentoDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.maestroDocumentoRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Maestro documento con ID ${id} no encontrado`);
    }
  }
}
