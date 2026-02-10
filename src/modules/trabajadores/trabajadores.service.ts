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
    // Validación de unicidad COMPUESTA: DNI + empresaId
    // Un mismo DNI puede existir en diferentes empresas, pero no dos veces en la misma empresa
    const existing = await this.trabajadorRepository.findOne({
      where: {
        documentoIdentidad: dto.documento_identidad,
        empresaId: dto.empresa_id,
      },
      withDeleted: false, // No incluir registros eliminados
    });

    if (existing) {
      throw new ConflictException(
        `El DNI ${dto.documento_identidad} ya se encuentra registrado para esta empresa`,
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
    // Verificar que el trabajador existe antes de intentar actualizar
    const trabajadorExistente = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario'],
      withDeleted: false,
    });

    if (!trabajadorExistente) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    // REGLA DE INTEGRIDAD: El DNI no puede ser modificado después de la creación
    // Nota: documento_identidad fue excluido de UpdateTrabajadorDto, por lo que esta validación ya no es necesaria
    // El ValidationPipe con whitelist: true rechazará automáticamente cualquier campo no definido en el DTO

    // Preparar el objeto de actualización mapeando snake_case del DTO a camelCase de la entidad
    // preload requiere el id y los campos en formato de la entidad (camelCase)
    const updateData: Partial<Trabajador> = {
      id, // Necesario para preload
    };

    // Mapear campos del DTO (snake_case) a la entidad (camelCase)
    // Solo incluir campos que están definidos en el DTO (undefined no se incluye)
    if (dto.nombre_completo !== undefined) {
      updateData.nombreCompleto = dto.nombre_completo;
    }
    // documentoIdentidad NO se actualiza - es inmutable después de la creación
    if (dto.cargo !== undefined) {
      updateData.cargo = dto.cargo;
    }
    // Manejar area_id: si viene explícitamente (incluso si es null), actualizar
    // Si viene como string vacío, convertir a null
    if (dto.area_id !== undefined) {
      if (dto.area_id === null || dto.area_id === '') {
        updateData.areaId = null;
      } else {
        updateData.areaId = dto.area_id;
      }
    }
    if (dto.telefono !== undefined) {
      updateData.telefono = dto.telefono || null;
    }
    if (dto.email !== undefined) {
      updateData.emailPersonal = dto.email || null;
    }
    if (dto.fecha_ingreso !== undefined) {
      updateData.fechaIngreso = new Date(dto.fecha_ingreso);
    }
    if (dto.estado !== undefined) {
      updateData.estado = dto.estado;
    }
    if (dto.grupo_sanguineo !== undefined) {
      updateData.grupoSanguineo = dto.grupo_sanguineo || null;
    }
    if (dto.contacto_emergencia_nombre !== undefined) {
      updateData.contactoEmergenciaNombre = dto.contacto_emergencia_nombre || null;
    }
    if (dto.contacto_emergencia_telefono !== undefined) {
      updateData.contactoEmergenciaTelefono = dto.contacto_emergencia_telefono || null;
    }
    if (dto.foto_url !== undefined) {
      updateData.fotoUrl = dto.foto_url || null;
    }
    if (dto.talla_casco !== undefined) {
      updateData.tallaCasco = dto.talla_casco || null;
    }
    if (dto.talla_camisa !== undefined) {
      updateData.tallaCamisa = dto.talla_camisa || null;
    }
    if (dto.talla_pantalon !== undefined) {
      updateData.tallaPantalon = dto.talla_pantalon || null;
    }
    if (dto.talla_calzado !== undefined) {
      // Convertir string a number si es necesario (el DTO puede venir como string o number)
      if (typeof dto.talla_calzado === 'string') {
        const parsed = parseInt(dto.talla_calzado, 10);
        updateData.tallaCalzado = isNaN(parsed) ? null : parsed;
      } else if (typeof dto.talla_calzado === 'number') {
        updateData.tallaCalzado = dto.talla_calzado;
      } else {
        updateData.tallaCalzado = null;
      }
    }
    if (dto.perfil_completado !== undefined) {
      updateData.perfilCompletado = dto.perfil_completado;
    }

    // Usar preload para cargar la entidad y aplicar los cambios de forma segura
    // preload busca la entidad por id y aplica los cambios parciales
    const trabajador = await this.trabajadorRepository.preload(updateData);

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado después de preload`);
    }

    // Guardar los cambios - esto persiste los datos en la base de datos
    const nuevoEstado = trabajador.estado;
    const estadoCambio = dto.estado !== undefined && dto.estado !== trabajadorExistente.estado;

    const saved = await this.trabajadorRepository.save(trabajador);

    // SINCRONIZACIÓN DE ESTADOS: Si el trabajador cambia a 'Inactivo', desactivar su usuario vinculado
    if (estadoCambio && nuevoEstado === EstadoTrabajador.Inactivo) {
      // Buscar el usuario vinculado usando QueryBuilder (la relación está en Usuario con trabajador_id)
      const usuarioVinculado = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.trabajador', 'trabajador')
        .where('trabajador.id = :trabajadorId', { trabajadorId: trabajador.id })
        .andWhere('usuario.deletedAt IS NULL') // Excluir soft-deleted
        .getOne();
      
      if (usuarioVinculado) {
        usuarioVinculado.activo = false;
        await this.usuarioRepository.save(usuarioVinculado);
      }
    }

    // Obtener la entidad actualizada fresca de la base de datos con todas las relaciones
    const updated = await this.trabajadorRepository.findOne({
      where: { id: saved.id },
      relations: ['usuario'],
      withDeleted: false,
    });

    if (!updated) {
      throw new NotFoundException(`Error al recuperar el trabajador actualizado con ID ${id}`);
    }

    return ResponseTrabajadorDto.fromEntity(updated);
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

  async buscarPorDni(dni: string): Promise<ResponseTrabajadorDto | null> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { documentoIdentidad: dni },
      relations: ['usuario', 'area', 'empresa'],
      withDeleted: false,
    });

    if (!trabajador) {
      return null;
    }

    return ResponseTrabajadorDto.fromEntity(trabajador);
  }
}
