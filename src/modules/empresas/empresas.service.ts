import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { Area } from './entities/area.entity';
import { Unidad } from './entities/unidad.entity';
import { Sede } from './entities/sede.entity';
import { Gerencia } from './entities/gerencia.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { CreateGerenciaDto } from './dto/create-gerencia.dto';
import { UpdateGerenciaDto } from './dto/update-gerencia.dto';
import { StorageService } from '../../common/services/storage.service';

export interface EstructuraItem {
  id: string;
  nombre: string;
  activo?: boolean;
  createdAt?: Date;
}

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Unidad)
    private readonly unidadRepository: Repository<Unidad>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Gerencia)
    private readonly gerenciaRepository: Repository<Gerencia>,
    private readonly storageService: StorageService,
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
      pais: dto.pais ?? null,
      departamento: dto.departamento ?? null,
      provincia: dto.provincia ?? null,
      distrito: dto.distrito ?? null,
      actividadEconomica: dto.actividad_economica ?? null,
      numeroTrabajadores: dto.numero_trabajadores ?? 0,
      logoUrl: dto.logoUrl ?? null,
      activo: dto.activo ?? true,
    });

    const saved = await this.empresaRepository.save(empresa);
    await this.inicializarEstructuraOrganizacional(saved.id);
    const empresaConRelaciones = await this.empresaRepository.findOne({
      where: { id: saved.id },
      relations: ['areas'],
    });
    return ResponseEmpresaDto.fromEntity(empresaConRelaciones!);
  }

  /** Crea Unidad Principal, Sede Principal, Gerencia General y Área General por defecto */
  private async inicializarEstructuraOrganizacional(empresaId: string): Promise<void> {
    await Promise.all([
      this.unidadRepository.save(
        this.unidadRepository.create({ empresaId, nombre: 'Unidad Principal', activo: true }),
      ),
      this.sedeRepository.save(
        this.sedeRepository.create({ empresaId, nombre: 'Sede Principal', activo: true }),
      ),
      this.gerenciaRepository.save(
        this.gerenciaRepository.create({ empresaId, nombre: 'Gerencia General', activo: true }),
      ),
      this.areaRepository.save(
        this.areaRepository.create({ empresaId, nombre: 'Área General', activo: true }),
      ),
    ]);
  }

  async findAll(): Promise<ResponseEmpresaDto[]> {
    const empresas = await this.empresaRepository.find({
      relations: ['areas'],
      order: { createdAt: 'DESC' },
    });
    const dtos = await Promise.all(
      empresas.map(async (e) => {
        const dto = ResponseEmpresaDto.fromEntity(e);
        if (dto.logoUrl && this.storageService.isAvailable()) {
          try {
            dto.logoUrl = await this.storageService.getSignedUrl(dto.logoUrl, 60);
          } catch {
            // Si falla la firma, mantener la URL original
          }
        }
        return dto;
      }),
    );
    return dtos;
  }

  async findOne(id: string): Promise<ResponseEmpresaDto> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    const dto = ResponseEmpresaDto.fromEntity(empresa);
    if (dto.logoUrl && this.storageService.isAvailable()) {
      try {
        dto.logoUrl = await this.storageService.getSignedUrl(dto.logoUrl, 60);
      } catch {
        // Si falla la firma, mantener la URL original
      }
    }
    return dto;
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
    if (dto.pais !== undefined) empresa.pais = dto.pais;
    if (dto.departamento !== undefined) empresa.departamento = dto.departamento;
    if (dto.provincia !== undefined) empresa.provincia = dto.provincia;
    if (dto.distrito !== undefined) empresa.distrito = dto.distrito;
    if (dto.actividad_economica !== undefined) empresa.actividadEconomica = dto.actividad_economica;
    if (dto.numero_trabajadores !== undefined) empresa.numeroTrabajadores = dto.numero_trabajadores;
    if (dto.logoUrl !== undefined) {
      empresa.logoUrl = this.storageService.getCanonicalUrl(dto.logoUrl) || dto.logoUrl;
    }
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

  async uploadLogo(ruc: string, buffer: Buffer, mimetype: string): Promise<string> {
    if (!this.storageService.isAvailable()) {
      throw new BadRequestException(
        'El almacenamiento en la nube no está configurado. Use la opción de URL manual.',
      );
    }
    const rucSanitized = ruc.replace(/[^a-zA-Z0-9]/g, '_');
    return this.storageService.uploadFile(rucSanitized, buffer, 'logo_empresa', {
      contentType: mimetype,
    });
  }

  async findAreasByEmpresa(empresaId: string): Promise<{ id: string; nombre: string }[]> {
    const areas = await this.areaRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' },
    });
    return areas.map((a) => ({ id: a.id, nombre: a.nombre }));
  }

  // --- Unidades ---
  async findUnidadesByEmpresa(empresaId: string): Promise<EstructuraItem[]> {
    const unidades = await this.unidadRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' },
    });
    return unidades.map((u) => ({ id: u.id, nombre: u.nombre, activo: u.activo, createdAt: u.createdAt }));
  }

  async createUnidad(empresaId: string, dto: Omit<CreateUnidadDto, 'empresa_id'>): Promise<EstructuraItem> {
    const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);

    const unidad = this.unidadRepository.create({
      nombre: dto.nombre,
      activo: dto.activo ?? true,
      empresaId,
    });
    const saved = await this.unidadRepository.save(unidad);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo, createdAt: saved.createdAt };
  }

  async updateUnidad(empresaId: string, id: string, dto: UpdateUnidadDto): Promise<EstructuraItem> {
    const unidad = await this.unidadRepository.findOne({ where: { id, empresaId } });
    if (!unidad) throw new NotFoundException(`Unidad con ID ${id} no encontrada`);

    if (dto.nombre !== undefined) unidad.nombre = dto.nombre;
    if (dto.activo !== undefined) unidad.activo = dto.activo;
    const saved = await this.unidadRepository.save(unidad);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo, createdAt: saved.createdAt };
  }

  async removeUnidad(empresaId: string, id: string): Promise<void> {
    const result = await this.unidadRepository.delete({ id, empresaId });
    if (result.affected === 0) throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
  }

  // --- Sedes ---
  async findSedesByEmpresa(empresaId: string): Promise<EstructuraItem[]> {
    const sedes = await this.sedeRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' },
    });
    return sedes.map((s) => ({ id: s.id, nombre: s.nombre, activo: s.activo, createdAt: s.createdAt }));
  }

  async createSede(empresaId: string, dto: Omit<CreateSedeDto, 'empresa_id'>): Promise<EstructuraItem> {
    const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);

    const sede = this.sedeRepository.create({
      nombre: dto.nombre,
      activo: dto.activo ?? true,
      empresaId,
    });
    const saved = await this.sedeRepository.save(sede);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo, createdAt: saved.createdAt };
  }

  async updateSede(empresaId: string, id: string, dto: UpdateSedeDto): Promise<EstructuraItem> {
    const sede = await this.sedeRepository.findOne({ where: { id, empresaId } });
    if (!sede) throw new NotFoundException(`Sede con ID ${id} no encontrada`);

    if (dto.nombre !== undefined) sede.nombre = dto.nombre;
    if (dto.activo !== undefined) sede.activo = dto.activo;
    const saved = await this.sedeRepository.save(sede);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo, createdAt: saved.createdAt };
  }

  async removeSede(empresaId: string, id: string): Promise<void> {
    const result = await this.sedeRepository.delete({ id, empresaId });
    if (result.affected === 0) throw new NotFoundException(`Sede con ID ${id} no encontrada`);
  }

  // --- Gerencias ---
  async findGerenciasByEmpresa(empresaId: string): Promise<EstructuraItem[]> {
    const gerencias = await this.gerenciaRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' },
    });
    return gerencias.map((g) => ({ id: g.id, nombre: g.nombre, activo: g.activo, createdAt: g.createdAt }));
  }

  async createGerencia(empresaId: string, dto: Omit<CreateGerenciaDto, 'empresa_id'>): Promise<EstructuraItem> {
    const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);

    const gerencia = this.gerenciaRepository.create({
      nombre: dto.nombre,
      activo: dto.activo ?? true,
      empresaId,
    });
    const saved = await this.gerenciaRepository.save(gerencia);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo, createdAt: saved.createdAt };
  }

  async updateGerencia(empresaId: string, id: string, dto: UpdateGerenciaDto): Promise<EstructuraItem> {
    const gerencia = await this.gerenciaRepository.findOne({ where: { id, empresaId } });
    if (!gerencia) throw new NotFoundException(`Gerencia con ID ${id} no encontrada`);

    if (dto.nombre !== undefined) gerencia.nombre = dto.nombre;
    if (dto.activo !== undefined) gerencia.activo = dto.activo;
    const saved = await this.gerenciaRepository.save(gerencia);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo, createdAt: saved.createdAt };
  }

  async removeGerencia(empresaId: string, id: string): Promise<void> {
    const result = await this.gerenciaRepository.delete({ id, empresaId });
    if (result.affected === 0) throw new NotFoundException(`Gerencia con ID ${id} no encontrada`);
  }
}
