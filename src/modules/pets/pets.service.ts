import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PETS, EstadoPETS } from './entities/pets.entity';
import { PetsPaso } from './entities/pets-paso.entity';
import { PetsLectura } from './entities/pets-lectura.entity';
import { CreatePetsDto } from './dto/create-pets.dto';
import { UpdatePetsDto } from './dto/update-pets.dto';
import { ResponsePetsDto } from './dto/response-pets.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PETS)
    private readonly petsRepository: Repository<PETS>,
    @InjectRepository(PetsPaso)
    private readonly pasoRepository: Repository<PetsPaso>,
    @InjectRepository(PetsLectura)
    private readonly lecturaRepository: Repository<PetsLectura>,
  ) {}

  async create(dto: CreatePetsDto): Promise<ResponsePetsDto> {
    const pets = this.petsRepository.create({
      codigo: dto.codigo,
      titulo: dto.titulo,
      version: 1,
      objetivo: dto.objetivo,
      alcance: dto.alcance,
      definiciones: dto.definiciones ?? null,
      areaProceso: dto.area_proceso ?? null,
      referenciasNormativas: dto.referencias_normativas ?? null,
      equiposMateriales: dto.equipos_materiales ?? null,
      requisitosPrevios: dto.requisitos_previos ?? null,
      fechaEmision: new Date(dto.fecha_emision),
      fechaRevision: dto.fecha_revision ? new Date(dto.fecha_revision) : null,
      elaboradorId: dto.elaborador_id,
      empresaId: dto.empresa_id,
      estado: EstadoPETS.Borrador,
    });

    const saved = await this.petsRepository.save(pets);

    // Guardar pasos
    if (dto.pasos && dto.pasos.length > 0) {
      const pasos = dto.pasos.map((p) =>
        this.pasoRepository.create({
          petsId: saved.id,
          numero: p.numero,
          descripcion: p.descripcion,
          peligros: p.peligros ?? null,
          medidasControl: p.medidas_control ?? null,
          eppRequerido: p.epp_requerido ?? null,
        }),
      );
      await this.pasoRepository.save(pasos);
    }

    return this.findOne(saved.id);
  }

  async findAll(empresaId?: string, estado?: EstadoPETS): Promise<ResponsePetsDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }
    if (estado) {
      where.estado = estado;
    }

    const petsList = await this.petsRepository.find({
      where,
      relations: ['elaborador', 'revisor', 'aprobador', 'pasos', 'lecturas'],
      order: { codigo: 'ASC', version: 'DESC' },
    });

    return petsList.map((p) => ResponsePetsDto.fromEntity(p));
  }

  async findOne(id: string): Promise<ResponsePetsDto> {
    const pets = await this.petsRepository.findOne({
      where: { id },
      relations: ['elaborador', 'revisor', 'aprobador', 'pasos', 'lecturas'],
    });

    if (!pets) {
      throw new NotFoundException(`PETS con ID ${id} no encontrado`);
    }

    return ResponsePetsDto.fromEntity(pets);
  }

  async update(id: string, dto: UpdatePetsDto): Promise<ResponsePetsDto> {
    const pets = await this.petsRepository.findOne({
      where: { id },
      relations: ['pasos'],
    });

    if (!pets) {
      throw new NotFoundException(`PETS con ID ${id} no encontrado`);
    }

    // Validar inmutabilidad si está Vigente
    if (pets.estado === EstadoPETS.Vigente) {
      throw new BadRequestException(
        'No se puede editar un PETS que está Vigente. Debe crear una nueva versión.',
      );
    }

    // Validar transiciones de estado
    if (dto.estado && dto.estado !== pets.estado) {
      this.validateEstadoTransition(pets.estado, dto.estado);
    }

    // Actualizar campos
    Object.assign(pets, {
      titulo: dto.titulo ?? pets.titulo,
      objetivo: dto.objetivo ?? pets.objetivo,
      alcance: dto.alcance ?? pets.alcance,
      definiciones: dto.definiciones ?? pets.definiciones,
      areaProceso: dto.area_proceso ?? pets.areaProceso,
      referenciasNormativas: dto.referencias_normativas ?? pets.referenciasNormativas,
      equiposMateriales: dto.equipos_materiales ?? pets.equiposMateriales,
      requisitosPrevios: dto.requisitos_previos ?? pets.requisitosPrevios,
      fechaRevision: dto.fecha_revision ? new Date(dto.fecha_revision) : pets.fechaRevision,
      revisorId: dto.revisor_id ?? pets.revisorId,
      aprobadorId: dto.aprobador_id ?? pets.aprobadorId,
    });

    // Manejar firmas según estado
    if (dto.estado === EstadoPETS.EnRevision && !pets.fechaFirmaRevisor) {
      pets.fechaFirmaRevisor = new Date();
    }
    if (dto.estado === EstadoPETS.Vigente && !pets.fechaFirmaAprobador) {
      pets.fechaFirmaAprobador = new Date();
      // Marcar versiones anteriores como obsoletas
      await this.petsRepository
        .createQueryBuilder()
        .update(PETS)
        .set({ estado: EstadoPETS.Obsoleto })
        .where('codigo = :codigo', { codigo: pets.codigo })
        .andWhere('version < :version', { version: pets.version })
        .andWhere('estado = :estado', { estado: EstadoPETS.Vigente })
        .execute();
    }

    if (dto.estado) {
      pets.estado = dto.estado;
    }

    await this.petsRepository.save(pets);

    // Actualizar pasos
    if (dto.pasos) {
      await this.pasoRepository.delete({ petsId: id });
      if (dto.pasos.length > 0) {
        const pasos = dto.pasos.map((p) =>
          this.pasoRepository.create({
            petsId: id,
            numero: p.numero,
            descripcion: p.descripcion,
            peligros: p.peligros ?? null,
            medidasControl: p.medidas_control ?? null,
            eppRequerido: p.epp_requerido ?? null,
          }),
        );
        await this.pasoRepository.save(pasos);
      }
    }

    return this.findOne(id);
  }

  validateEstadoTransition(estadoActual: EstadoPETS, estadoNuevo: EstadoPETS): void {
    const transicionesPermitidas: Record<EstadoPETS, EstadoPETS[]> = {
      [EstadoPETS.Borrador]: [EstadoPETS.PendienteRevision],
      [EstadoPETS.PendienteRevision]: [EstadoPETS.EnRevision],
      [EstadoPETS.EnRevision]: [EstadoPETS.Vigente, EstadoPETS.Borrador],
      [EstadoPETS.Vigente]: [],
      [EstadoPETS.Obsoleto]: [],
    };

    const permitidos = transicionesPermitidas[estadoActual];
    if (!permitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`,
      );
    }
  }

  async crearNuevaVersion(codigo: string): Promise<ResponsePetsDto> {
    const versionActual = await this.petsRepository.findOne({
      where: { codigo, estado: EstadoPETS.Vigente },
      relations: ['pasos'],
    });

    if (!versionActual) {
      throw new NotFoundException(`PETS con código ${codigo} no encontrado o no está Vigente`);
    }

    const nuevaVersion = this.petsRepository.create({
      codigo: versionActual.codigo,
      titulo: versionActual.titulo,
      version: versionActual.version + 1,
      objetivo: versionActual.objetivo,
      alcance: versionActual.alcance,
      definiciones: versionActual.definiciones,
      areaProceso: versionActual.areaProceso,
      referenciasNormativas: versionActual.referenciasNormativas,
      equiposMateriales: versionActual.equiposMateriales,
      requisitosPrevios: versionActual.requisitosPrevios,
      fechaEmision: new Date(),
      elaboradorId: versionActual.elaboradorId,
      empresaId: versionActual.empresaId,
      estado: EstadoPETS.Borrador,
    });

    const saved = await this.petsRepository.save(nuevaVersion);

    // Clonar pasos
    if (versionActual.pasos && versionActual.pasos.length > 0) {
      const pasos = versionActual.pasos.map((p) =>
        this.pasoRepository.create({
          petsId: saved.id,
          numero: p.numero,
          descripcion: p.descripcion,
          peligros: p.peligros,
          medidasControl: p.medidasControl,
          eppRequerido: p.eppRequerido,
        }),
      );
      await this.pasoRepository.save(pasos);
    }

    return this.findOne(saved.id);
  }

  async registrarLectura(petsId: string, usuarioId: string, usuarioNombre: string): Promise<void> {
    const existing = await this.lecturaRepository.findOne({
      where: { petsId, usuarioId },
    });

    if (existing) {
      throw new ConflictException('Ya has leído este PETS');
    }

    const lectura = this.lecturaRepository.create({
      petsId,
      usuarioId,
      usuarioNombre,
      fechaLectura: new Date(),
      aceptado: true,
    });

    await this.lecturaRepository.save(lectura);
  }

  async remove(id: string): Promise<void> {
    const pets = await this.petsRepository.findOne({ where: { id } });

    if (!pets) {
      throw new NotFoundException(`PETS con ID ${id} no encontrado`);
    }

    if (pets.estado === EstadoPETS.Vigente) {
      throw new BadRequestException('No se puede eliminar un PETS que está Vigente');
    }

    await this.petsRepository.remove(pets);
  }
}
