import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trabajador, EstadoTrabajador } from './entities/trabajador.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto, UpdatePersonalDataDto } from './dto/update-trabajador.dto';
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto';

@Injectable()
export class TrabajadoresService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  async create(dto: CreateTrabajadorDto): Promise<ResponseTrabajadorDto> {
    const existing = await this.trabajadorRepository.findOne({
      where: {
        documentoIdentidad: dto.documento_identidad,
        empresaId: dto.empresa_id,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un trabajador con ese documento de identidad en esta empresa',
      );
    }

    const trabajador = this.trabajadorRepository.create({
      nombreCompleto: dto.nombre_completo,
      documentoIdentidad: dto.documento_identidad,
      cargo: dto.cargo,
      areaId: dto.area_id ?? null,
      telefono: dto.telefono ?? null,
      emailPersonal: dto.email ?? null,
      fechaIngreso: new Date(dto.fecha_ingreso),
      estado: dto.estado ?? EstadoTrabajador.Activo,
      grupoSanguineo: dto.grupo_sanguineo ?? null,
      contactoEmergenciaNombre: dto.contacto_emergencia ?? null,
      contactoEmergenciaTelefono: null,
      fotoUrl: dto.foto_url ?? null,
      empresaId: dto.empresa_id,
    });

    await this.trabajadorRepository.save(trabajador);
    const saved = await this.trabajadorRepository.findOne({
      where: { id: trabajador.id },
      relations: ['usuario'],
    });
    return ResponseTrabajadorDto.fromEntity(saved!);
  }

  async findAll(empresaId?: string): Promise<ResponseTrabajadorDto[]> {
    const where = empresaId ? { empresaId } : {};
    const trabajadores = await this.trabajadorRepository.find({
      where,
      relations: ['usuario'],
      order: { nombreCompleto: 'ASC' },
    });
    return trabajadores.map((t) => ResponseTrabajadorDto.fromEntity(t));
  }

  async findOne(id: string): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    return ResponseTrabajadorDto.fromEntity(trabajador);
  }

  async update(
    id: string,
    dto: UpdateTrabajadorDto,
  ): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({ where: { id } });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    if (dto.documento_identidad && dto.documento_identidad !== trabajador.documentoIdentidad) {
      const existing = await this.trabajadorRepository.findOne({
        where: {
          documentoIdentidad: dto.documento_identidad,
          empresaId: trabajador.empresaId,
        },
      });
      if (existing) {
        throw new ConflictException(
          'Ya existe un trabajador con ese documento de identidad en esta empresa',
        );
      }
    }

    Object.assign(trabajador, {
      nombreCompleto: dto.nombre_completo ?? trabajador.nombreCompleto,
      documentoIdentidad: dto.documento_identidad ?? trabajador.documentoIdentidad,
      cargo: dto.cargo ?? trabajador.cargo,
      areaId: dto.area_id !== undefined ? dto.area_id : trabajador.areaId,
      telefono: dto.telefono !== undefined ? dto.telefono : trabajador.telefono,
      emailPersonal: dto.email !== undefined ? dto.email : trabajador.emailPersonal,
      fechaIngreso: dto.fecha_ingreso
        ? new Date(dto.fecha_ingreso)
        : trabajador.fechaIngreso,
      estado: dto.estado ?? trabajador.estado,
      grupoSanguineo: dto.grupo_sanguineo !== undefined ? dto.grupo_sanguineo : trabajador.grupoSanguineo,
      contactoEmergenciaNombre:
        dto.contacto_emergencia !== undefined
          ? dto.contacto_emergencia
          : trabajador.contactoEmergenciaNombre,
      fotoUrl: dto.foto_url !== undefined ? dto.foto_url : trabajador.fotoUrl,
      tallaCasco: dto.talla_casco !== undefined ? dto.talla_casco : trabajador.tallaCasco,
      tallaCamisa: dto.talla_camisa !== undefined ? dto.talla_camisa : trabajador.tallaCamisa,
      tallaPantalon: dto.talla_pantalon !== undefined ? dto.talla_pantalon : trabajador.tallaPantalon,
      tallaCalzado: dto.talla_calzado !== undefined ? dto.talla_calzado : trabajador.tallaCalzado,
      perfilCompletado: dto.perfil_completado !== undefined ? dto.perfil_completado : trabajador.perfilCompletado,
    });

    await this.trabajadorRepository.save(trabajador);
    const updated = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    return ResponseTrabajadorDto.fromEntity(updated!);
  }

  async remove(id: string): Promise<void> {
    const result = await this.trabajadorRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
  }

  async updatePersonalData(
    id: string,
    dto: UpdatePersonalDataDto,
  ): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({ where: { id } });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    Object.assign(trabajador, {
      tallaCasco: dto.talla_casco !== undefined ? dto.talla_casco : trabajador.tallaCasco,
      tallaCamisa: dto.talla_camisa !== undefined ? dto.talla_camisa : trabajador.tallaCamisa,
      tallaPantalon: dto.talla_pantalon !== undefined ? dto.talla_pantalon : trabajador.tallaPantalon,
      tallaCalzado: dto.talla_calzado !== undefined ? parseInt(dto.talla_calzado) : trabajador.tallaCalzado,
      perfilCompletado: true, // Al actualizar datos personales, marcar perfil como completado
    });

    await this.trabajadorRepository.save(trabajador);
    const updated = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    return ResponseTrabajadorDto.fromEntity(updated!);
  }
}
