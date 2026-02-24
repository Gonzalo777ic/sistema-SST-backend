import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from './entities/cargo.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { ResponseCargoDto } from './dto/response-cargo.dto';

const CARGOS_DEFAULT: string[] = [
  'ALMACENERO',
  'ANALISTA DE OPERACIONES',
  'ASISTENTE DE COMPRAS',
  'AUXILIAR CONTABLE',
  'AUXILIAR DE MECÁNICO',
  'AUXILIAR LABORATORIO DE CALIDAD',
  'AUXILIAR OFICINA',
  'AUXILIAR R.R.H.H',
  'AUXILIAR VENTAS',
  'AYUD. OPERARIO',
  'AYUDANTE DE ELECTRICIDAD',
  'AYUDANTE DE MANTENIMIENTO',
  'AYUDANTE DE OPERACIONES',
  'AYUDANTE OPERARIO',
  'COMERCIAL',
  'CONTADORA',
  'CONTADORA GENERAL',
  'CONTROL DE CALIDAD',
  'COORDINADORA',
  'ELECTRICISTA',
  'EMPLEADO TNT',
  'GERENTE ADMINISTRATIVO',
  'GERENTE DE OPERACIONES',
  'GERENTE GENERAL',
  'GESTOR DE CUENTAS',
  'JEFE DE PRODUCCIÓN',
  'MECÁNICO DE MANTENIMIENTO',
  'MECÁNICO ELECTRICISTA',
  'MÉDICO OCUPACIONAL',
  'MONTACARGUISTA',
  'OPERARIO',
  'OPERARIO DE TNT',
  'OPERARIO EXTRUSORA',
  'OPERARIO LAVADO',
  'OPERARIO PRENSADO',
  'OPERARIO TNT',
  'PRACTICANTE',
  'PRACTICANTE PRE PROFESIONAL',
  'PRESIDENTE DIRECTORIO',
  'RESPONSABLE MANTENIMIENTO',
  'RR.HH.',
  'SOLDADOR',
  'VIGILANTE SEGURIDAD',
];

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.cargoRepository.count();
    if (count === 0) {
      for (const nombre of CARGOS_DEFAULT) {
        const cargo = this.cargoRepository.create({ nombre, activo: true });
        await this.cargoRepository.save(cargo);
      }
    }
  }

  async findAll(activoOnly = true): Promise<ResponseCargoDto[]> {
    const where = activoOnly ? { activo: true } : {};
    const cargos = await this.cargoRepository.find({
      where,
      order: { nombre: 'ASC' },
      withDeleted: !activoOnly,
    });
    return cargos.map((c) => ResponseCargoDto.fromEntity(c));
  }

  async findOne(id: string): Promise<ResponseCargoDto> {
    const cargo = await this.cargoRepository.findOne({ where: { id } });
    if (!cargo) {
      throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    }
    return ResponseCargoDto.fromEntity(cargo);
  }

  async create(dto: CreateCargoDto): Promise<ResponseCargoDto> {
    const nombreNorm = dto.nombre.trim();
    const existente = await this.cargoRepository
      .createQueryBuilder('c')
      .where('LOWER(TRIM(c.nombre)) = LOWER(:nombre)', { nombre: nombreNorm })
      .getOne();
    if (existente) {
      throw new ConflictException(`Ya existe un cargo con el nombre "${dto.nombre}"`);
    }
    const cargo = this.cargoRepository.create({
      nombre: dto.nombre.trim(),
      activo: dto.activo ?? true,
    });
    const saved = await this.cargoRepository.save(cargo);
    return ResponseCargoDto.fromEntity(saved);
  }

  async update(id: string, dto: UpdateCargoDto): Promise<ResponseCargoDto> {
    const cargo = await this.cargoRepository.findOne({ where: { id } });
    if (!cargo) {
      throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    }
    if (dto.nombre !== undefined) {
      const nombreNorm = dto.nombre.trim();
      const existente = await this.cargoRepository
        .createQueryBuilder('c')
        .where('LOWER(TRIM(c.nombre)) = LOWER(:nombre)', { nombre: nombreNorm })
        .andWhere('c.id != :id', { id })
        .getOne();
      if (existente) {
        throw new ConflictException(`Ya existe un cargo con el nombre "${dto.nombre}"`);
      }
      cargo.nombre = nombreNorm;
    }
    if (dto.activo !== undefined) cargo.activo = dto.activo;
    const saved = await this.cargoRepository.save(cargo);
    return ResponseCargoDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.cargoRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    }
  }
}
