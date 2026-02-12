import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { Area } from './entities/area.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { CreateAreaDto } from './dto/create-area.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async create(dto: CreateEmpresaDto): Promise<ResponseEmpresaDto> {
    const existing = await this.empresaRepository.findOne({
      where: { ruc: dto.ruc },
    });

    if (existing) {
      throw new ConflictException('Ya existe una empresa con ese RUC');
    }

    const empresa = this.empresaRepository.create({
      nombre: dto.nombre,
      ruc: dto.ruc,
      direccion: dto.direccion ?? null,
      actividadEconomica: dto.actividad_economica ?? null,
      logoUrl: dto.logoUrl ?? null,
      activo: dto.activo ?? true,
    });

    const saved = await this.empresaRepository.save(empresa);
    return ResponseEmpresaDto.fromEntity(saved);
  }

  async findAll(): Promise<ResponseEmpresaDto[]> {
    const empresas = await this.empresaRepository.find({
      order: { createdAt: 'DESC' },
    });
    return empresas.map((e) => ResponseEmpresaDto.fromEntity(e));
  }

  async findOne(id: string): Promise<ResponseEmpresaDto> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return ResponseEmpresaDto.fromEntity(empresa);
  }

  async update(id: string, dto: UpdateEmpresaDto): Promise<ResponseEmpresaDto> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    if (dto.ruc && dto.ruc !== empresa.ruc) {
      const existingRuc = await this.empresaRepository.findOne({
        where: { ruc: dto.ruc },
      });
      if (existingRuc) {
        throw new ConflictException('Ya existe una empresa con ese RUC');
      }
    }

    if (dto.nombre !== undefined) empresa.nombre = dto.nombre;
    if (dto.ruc !== undefined) empresa.ruc = dto.ruc;
    if (dto.direccion !== undefined) empresa.direccion = dto.direccion;
    if (dto.actividad_economica !== undefined) empresa.actividadEconomica = dto.actividad_economica;
    if (dto.logoUrl !== undefined) empresa.logoUrl = dto.logoUrl;
    if (dto.activo !== undefined) empresa.activo = dto.activo;

    const saved = await this.empresaRepository.save(empresa);
    return ResponseEmpresaDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.empresaRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }
  }

  async createArea(empresaId: string, dto: CreateAreaDto): Promise<{ id: string; nombre: string }> {
    const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
    }

    const area = this.areaRepository.create({
      nombre: dto.nombre,
      empresaId,
    });

    const saved = await this.areaRepository.save(area);
    return { id: saved.id, nombre: saved.nombre };
  }

  async findAreasByEmpresa(empresaId: string): Promise<{ id: string; nombre: string }[]> {
    const areas = await this.areaRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' },
    });
    return areas.map((a) => ({ id: a.id, nombre: a.nombre }));
  }
}
