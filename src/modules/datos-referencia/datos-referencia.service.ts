import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatoReferencia, TipoDatoReferencia } from './entities/dato-referencia.entity';
import { CreateDatoReferenciaDto } from './dto/create-dato-referencia.dto';
import { UpdateDatoReferenciaDto } from './dto/update-dato-referencia.dto';
import { ResponseDatoReferenciaDto } from './dto/response-dato-referencia.dto';

const DEFAULTS: Record<TipoDatoReferencia, string[]> = {
  [TipoDatoReferencia.NIVEL_EXPOSICION]: ['MUY ALTO', 'ALTO', 'MEDIO', 'BAJO'],
  [TipoDatoReferencia.TIPO_USUARIO]: ['CONTRATADO', 'CONTRATISTA'],
  [TipoDatoReferencia.MODALIDAD_CONTRATO]: [
    'SERVIR',
    'TERCERO',
    'TERCERO SUPERVISOR',
    'PRACTICANTE PROFESIONAL',
    'CAS',
    'LOCADOR',
    'PRACTICANTE PRE PROFESIONAL DL 728',
    'INDETERMINADO PLAZO FIJO',
  ],
  [TipoDatoReferencia.CENTRO_COSTOS]: [],
};

@Injectable()
export class DatosReferenciaService {
  constructor(
    @InjectRepository(DatoReferencia)
    private readonly repo: Repository<DatoReferencia>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const tipo of Object.values(TipoDatoReferencia)) {
      const valors = DEFAULTS[tipo];
      if (valors.length === 0) continue;
      const count = await this.repo.count({ where: { tipo } });
      if (count === 0) {
        for (let i = 0; i < valors.length; i++) {
          const d = this.repo.create({
            tipo,
            valor: valors[i],
            orden: i,
            activo: true,
          });
          await this.repo.save(d);
        }
      }
    }
  }

  async findAll(tipo?: TipoDatoReferencia, activoOnly = true): Promise<ResponseDatoReferenciaDto[]> {
    const where: Record<string, unknown> = activoOnly ? { activo: true } : {};
    if (tipo) where.tipo = tipo;
    const items = await this.repo.find({
      where,
      order: { tipo: 'ASC', orden: 'ASC', valor: 'ASC' },
      withDeleted: !activoOnly,
    });
    return items.map((d) => ResponseDatoReferenciaDto.fromEntity(d));
  }

  async findOne(id: string): Promise<ResponseDatoReferenciaDto> {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Dato de referencia con ID ${id} no encontrado`);
    return ResponseDatoReferenciaDto.fromEntity(d);
  }

  async create(dto: CreateDatoReferenciaDto): Promise<ResponseDatoReferenciaDto> {
    const valorNorm = dto.valor.trim();
    const existente = await this.repo
      .createQueryBuilder('d')
      .where('d.tipo = :tipo', { tipo: dto.tipo })
      .andWhere('LOWER(TRIM(d.valor)) = LOWER(:valor)', { valor: valorNorm })
      .getOne();
    if (existente) {
      throw new ConflictException(`Ya existe un valor "${dto.valor}" para ${dto.tipo}`);
    }
    const maxOrden = await this.repo
      .createQueryBuilder('d')
      .select('MAX(d.orden)', 'max')
      .where('d.tipo = :tipo', { tipo: dto.tipo })
      .getRawOne();
    const orden = dto.orden ?? (Number(maxOrden?.max) ?? 0) + 1;
    const d = this.repo.create({
      tipo: dto.tipo,
      valor: valorNorm,
      orden,
      activo: dto.activo ?? true,
    });
    const saved = await this.repo.save(d);
    return ResponseDatoReferenciaDto.fromEntity(saved);
  }

  async update(id: string, dto: UpdateDatoReferenciaDto): Promise<ResponseDatoReferenciaDto> {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Dato de referencia con ID ${id} no encontrado`);
    if (dto.valor !== undefined) {
      const valorNorm = dto.valor.trim();
      const existente = await this.repo
        .createQueryBuilder('dr')
        .where('dr.tipo = :tipo', { tipo: d.tipo })
        .andWhere('LOWER(TRIM(dr.valor)) = LOWER(:valor)', { valor: valorNorm })
        .andWhere('dr.id != :id', { id })
        .getOne();
      if (existente) {
        throw new ConflictException(`Ya existe un valor "${dto.valor}" para ${d.tipo}`);
      }
      d.valor = valorNorm;
    }
    if (dto.orden !== undefined) d.orden = dto.orden;
    if (dto.activo !== undefined) d.activo = dto.activo;
    const saved = await this.repo.save(d);
    return ResponseDatoReferenciaDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dato de referencia con ID ${id} no encontrado`);
    }
  }
}
