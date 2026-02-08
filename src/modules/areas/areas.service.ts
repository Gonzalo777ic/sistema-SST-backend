import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from '../empresas/entities/area.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { ResponseAreaDto } from './dto/response-area.dto';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(dto: CreateAreaDto): Promise<ResponseAreaDto> {
    // Verificar que la empresa existe
    const empresa = await this.empresaRepository.findOne({
      where: { id: dto.empresa_id },
    });

    if (!empresa) {
      throw new NotFoundException(
        `Empresa con ID ${dto.empresa_id} no encontrada`,
      );
    }

    // Verificar que no exista un área con el mismo nombre en la misma empresa
    const existing = await this.areaRepository.findOne({
      where: {
        nombre: dto.nombre,
        empresaId: dto.empresa_id,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un área con el nombre "${dto.nombre}" en esta empresa`,
      );
    }

    const area = this.areaRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      activo: dto.activo ?? true,
      empresaId: dto.empresa_id,
    });

    const saved = await this.areaRepository.save(area);
    return ResponseAreaDto.fromEntity({
      ...saved,
      empresaId: saved.empresaId,
    });
  }

  async findAll(empresaId?: string): Promise<ResponseAreaDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
      where.activo = true; // Solo áreas activas cuando se filtra por empresa
    }

    const areas = await this.areaRepository.find({
      where,
      order: { nombre: 'ASC' },
    });

    return areas.map((area) =>
      ResponseAreaDto.fromEntity({
        ...area,
        empresaId: area.empresaId,
      }),
    );
  }

  async findOne(id: string): Promise<ResponseAreaDto> {
    const area = await this.areaRepository.findOne({ where: { id } });

    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }

    return ResponseAreaDto.fromEntity({
      ...area,
      empresaId: area.empresaId,
    });
  }

  async update(id: string, dto: UpdateAreaDto): Promise<ResponseAreaDto> {
    const area = await this.areaRepository.findOne({ where: { id } });

    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }

    // Si se cambia el nombre, verificar que no exista otro con el mismo nombre en la misma empresa
    if (dto.nombre && dto.nombre !== area.nombre) {
      const existing = await this.areaRepository.findOne({
        where: {
          nombre: dto.nombre,
          empresaId: dto.empresa_id || area.empresaId,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe un área con el nombre "${dto.nombre}" en esta empresa`,
        );
      }
    }

    // Si se cambia la empresa, verificar que existe
    if (dto.empresa_id && dto.empresa_id !== area.empresaId) {
      const empresa = await this.empresaRepository.findOne({
        where: { id: dto.empresa_id },
      });

      if (!empresa) {
        throw new NotFoundException(
          `Empresa con ID ${dto.empresa_id} no encontrada`,
        );
      }
    }

    Object.assign(area, {
      nombre: dto.nombre ?? area.nombre,
      descripcion: dto.descripcion !== undefined ? dto.descripcion : area.descripcion,
      activo: dto.activo !== undefined ? dto.activo : area.activo,
      empresaId: dto.empresa_id ?? area.empresaId,
    });

    const saved = await this.areaRepository.save(area);
    return ResponseAreaDto.fromEntity({
      ...saved,
      empresaId: saved.empresaId,
    });
  }

  async remove(id: string): Promise<void> {
    const area = await this.areaRepository.findOne({ where: { id } });

    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }

    await this.areaRepository.remove(area);
  }
}
