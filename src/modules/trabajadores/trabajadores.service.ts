import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trabajador, EstadoTrabajador } from './entities/trabajador.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto, UpdatePersonalDataDto } from './dto/update-trabajador.dto';
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto';

@Injectable()
export class TrabajadoresService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(dto: CreateTrabajadorDto): Promise<ResponseTrabajadorDto> {
    // Buscar trabajadores existentes excluyendo los eliminados (soft delete)
    const existing = await this.trabajadorRepository.findOne({
      where: {
        documentoIdentidad: dto.documento_identidad,
        empresaId: dto.empresa_id,
      },
      withDeleted: false, // No incluir registros eliminados
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
      contactoEmergenciaNombre: dto.contacto_emergencia_nombre ?? null,
      contactoEmergenciaTelefono: dto.contacto_emergencia_telefono ?? null,
      fotoUrl: dto.foto_url ?? null,
      empresaId: dto.empresa_id,
    });

    await this.trabajadorRepository.save(trabajador);
    const saved = await this.trabajadorRepository.findOne({
      where: { id: trabajador.id },
      relations: ['usuario'],
      withDeleted: false, // No incluir registros eliminados
    });
    return ResponseTrabajadorDto.fromEntity(saved!);
  }

  async findAll(empresaId?: string): Promise<ResponseTrabajadorDto[]> {
    const where = empresaId ? { empresaId } : {};
    const trabajadores = await this.trabajadorRepository.find({
      where,
      relations: ['usuario'],
      order: { nombreCompleto: 'ASC' },
      withDeleted: false, // No incluir registros eliminados (soft delete)
    });
    return trabajadores.map((t) => ResponseTrabajadorDto.fromEntity(t));
  }

  async findOne(id: string): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario'],
      withDeleted: false, // No incluir registros eliminados (soft delete)
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
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      withDeleted: false, // No incluir registros eliminados
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    // REGLA DE INTEGRIDAD: El DNI no puede ser modificado después de la creación
    // Para corregir el DNI, es necesario eliminar y volver a crear el registro
    if (dto.documento_identidad && dto.documento_identidad !== trabajador.documentoIdentidad) {
      throw new ConflictException(
        'El documento de identidad no puede ser modificado. Para corregirlo, elimine y vuelva a crear el registro.',
      );
    }

    Object.assign(trabajador, {
      nombreCompleto: dto.nombre_completo ?? trabajador.nombreCompleto,
      // documentoIdentidad NO se actualiza - es inmutable después de la creación
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
        dto.contacto_emergencia_nombre !== undefined
          ? dto.contacto_emergencia_nombre
          : trabajador.contactoEmergenciaNombre,
      contactoEmergenciaTelefono:
        dto.contacto_emergencia_telefono !== undefined
          ? dto.contacto_emergencia_telefono
          : trabajador.contactoEmergenciaTelefono,
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
      withDeleted: false, // No incluir registros eliminados
    });
    return ResponseTrabajadorDto.fromEntity(updated!);
  }

  async remove(id: string): Promise<void> {
    // Buscar el trabajador con su usuario vinculado antes de eliminar
    // Excluir registros ya eliminados (soft delete)
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario'],
      withDeleted: false, // No incluir registros eliminados
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    // Realizar Soft Delete del trabajador
    await this.trabajadorRepository.softRemove(trabajador);

    // Regla de Cascada: Si tiene un Usuario vinculado, desactivarlo y aplicar Soft Delete
    if (trabajador.usuario) {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: trabajador.usuario.id },
        withDeleted: false,
      });

      if (usuario) {
        // Desactivar el usuario para impedir acceso inmediato
        usuario.activo = false;
        await this.usuarioRepository.save(usuario);
        
        // Aplicar Soft Delete también al usuario
        // Esto preserva la información según las leyes de SST (20 años para incidentes graves)
        await this.usuarioRepository.softRemove(usuario);
      }
    }
  }

  async updatePersonalData(
    id: string,
    dto: UpdatePersonalDataDto,
  ): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      withDeleted: false, // No incluir registros eliminados
    });

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
      withDeleted: false, // No incluir registros eliminados
    });
    return ResponseTrabajadorDto.fromEntity(updated!);
  }
}
