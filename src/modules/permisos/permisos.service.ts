import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PermisoTrabajo,
  EstadoPermiso,
} from './entities/permiso-trabajo.entity';
import { TrabajadorPermiso } from './entities/trabajador-permiso.entity';
import { CreatePermisoTrabajoDto } from './dto/create-permiso-trabajo.dto';
import { UpdatePermisoTrabajoDto } from './dto/update-permiso-trabajo.dto';
import { ResponsePermisoTrabajoDto } from './dto/response-permiso-trabajo.dto';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(PermisoTrabajo)
    private readonly permisoRepository: Repository<PermisoTrabajo>,
    @InjectRepository(TrabajadorPermiso)
    private readonly trabajadorPermisoRepository: Repository<TrabajadorPermiso>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  async generateNumeroPermiso(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PT-${year}-`;
    const existing = await this.permisoRepository
      .createQueryBuilder('permiso')
      .where('permiso.numero_permiso LIKE :prefix', { prefix: `${prefix}%` })
      .getCount();
    return `${prefix}${String(existing + 1).padStart(3, '0')}`;
  }

  async create(dto: CreatePermisoTrabajoDto): Promise<ResponsePermisoTrabajoDto> {
    const numeroPermiso = dto.numero_permiso || (await this.generateNumeroPermiso());

    // Verificar unicidad
    const existing = await this.permisoRepository.findOne({
      where: { numeroPermiso },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un permiso con el número ${numeroPermiso}`,
      );
    }

    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaFin = new Date(dto.fecha_fin);

    // Validar fechas
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar duración máxima (12 horas)
    const diffHours = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
    if (diffHours > 12) {
      throw new BadRequestException(
        'Un permiso no puede durar más de 12 horas',
      );
    }

    const permiso = this.permisoRepository.create({
      numeroPermiso,
      tipoPermiso: dto.tipo_permiso,
      fechaInicio,
      fechaFin,
      ubicacionEspecifica: dto.ubicacion_especifica,
      descripcionTrabajo: dto.descripcion_trabajo,
      eppRequerido: dto.epp_requerido ?? null,
      herramientasEquipos: dto.herramientas_equipos ?? null,
      peligrosIdentificados: dto.peligros_identificados ?? null,
      fotosEvidencia: dto.fotos_evidencia ?? null,
      supervisorResponsableId: dto.supervisor_responsable_id,
      aprobadorSstId: dto.aprobador_sst_id ?? null,
      firmaSupervisorUrl: dto.firma_supervisor_url ?? null,
      firmaAprobadorUrl: dto.firma_aprobador_url ?? null,
      estado: dto.estado ?? EstadoPermiso.Borrador,
      empresaId: dto.empresa_id,
      areaTrabajoId: dto.area_trabajo_id ?? null,
      creadoPorId: dto.creado_por_id,
    });

    const saved = await this.permisoRepository.save(permiso);

    // Guardar trabajadores
    if (dto.trabajadores && dto.trabajadores.length > 0) {
      const trabajadoresEntities = await Promise.all(
        dto.trabajadores.map(async (t) => {
          const trabajador = await this.trabajadorRepository.findOne({
            where: { id: t.trabajador_id },
          });

          return this.trabajadorPermisoRepository.create({
            permisoId: saved.id,
            trabajadorId: t.trabajador_id,
            nombreTrabajador: t.nombre,
            documentoTrabajador: t.documento,
            rol: t.rol ?? null,
            confirmadoLectura: false,
          });
        }),
      );
      await this.trabajadorPermisoRepository.save(trabajadoresEntities);
    }

    return this.findOne(saved.id);
  }

  async findAll(
    empresaId?: string,
    trabajadorId?: string,
    estado?: EstadoPermiso,
  ): Promise<ResponsePermisoTrabajoDto[]> {
    const queryBuilder = this.permisoRepository
      .createQueryBuilder('permiso')
      .leftJoinAndSelect('permiso.supervisorResponsable', 'supervisor')
      .leftJoinAndSelect('permiso.aprobadorSst', 'aprobador')
      .leftJoinAndSelect('permiso.areaTrabajo', 'area')
      .leftJoinAndSelect('permiso.trabajadores', 'trabajadores')
      .orderBy('permiso.createdAt', 'DESC');

    if (empresaId) {
      queryBuilder.andWhere('permiso.empresaId = :empresaId', { empresaId });
    }

    if (trabajadorId) {
      queryBuilder.andWhere('trabajadores.trabajadorId = :trabajadorId', {
        trabajadorId,
      });
    }

    if (estado) {
      queryBuilder.andWhere('permiso.estado = :estado', { estado });
    }

    const permisos = await queryBuilder.getMany();
    return permisos.map((p) => ResponsePermisoTrabajoDto.fromEntity(p));
  }

  async findOne(id: string): Promise<ResponsePermisoTrabajoDto> {
    const permiso = await this.permisoRepository.findOne({
      where: { id },
      relations: [
        'supervisorResponsable',
        'aprobadorSst',
        'areaTrabajo',
        'trabajadores',
      ],
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return ResponsePermisoTrabajoDto.fromEntity(permiso);
  }

  async update(
    id: string,
    dto: UpdatePermisoTrabajoDto,
  ): Promise<ResponsePermisoTrabajoDto> {
    const permiso = await this.permisoRepository.findOne({
      where: { id },
      relations: ['trabajadores'],
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    // Validar transiciones de estado
    if (dto.estado && dto.estado !== permiso.estado) {
      this.validateEstadoTransition(permiso.estado, dto.estado);
    }

    // Actualizar campos
    if (dto.tipo_permiso !== undefined) permiso.tipoPermiso = dto.tipo_permiso;
    if (dto.fecha_inicio !== undefined)
      permiso.fechaInicio = new Date(dto.fecha_inicio);
    if (dto.fecha_fin !== undefined) permiso.fechaFin = new Date(dto.fecha_fin);
    if (dto.ubicacion_especifica !== undefined)
      permiso.ubicacionEspecifica = dto.ubicacion_especifica;
    if (dto.descripcion_trabajo !== undefined)
      permiso.descripcionTrabajo = dto.descripcion_trabajo;
    if (dto.epp_requerido !== undefined) permiso.eppRequerido = dto.epp_requerido;
    if (dto.herramientas_equipos !== undefined)
      permiso.herramientasEquipos = dto.herramientas_equipos;
    if (dto.peligros_identificados !== undefined)
      permiso.peligrosIdentificados = dto.peligros_identificados;
    if (dto.fotos_evidencia !== undefined)
      permiso.fotosEvidencia = dto.fotos_evidencia;
    if (dto.supervisor_responsable_id !== undefined)
      permiso.supervisorResponsableId = dto.supervisor_responsable_id;
    if (dto.aprobador_sst_id !== undefined)
      permiso.aprobadorSstId = dto.aprobador_sst_id;
    if (dto.firma_supervisor_url !== undefined)
      permiso.firmaSupervisorUrl = dto.firma_supervisor_url;
    if (dto.firma_aprobador_url !== undefined)
      permiso.firmaAprobadorUrl = dto.firma_aprobador_url;
    if (dto.area_trabajo_id !== undefined)
      permiso.areaTrabajoId = dto.area_trabajo_id;

    // Manejar cambio de estado
    if (dto.estado) {
      permiso.estado = dto.estado;

      // Auto-completar fechas según el estado
      if (dto.estado === EstadoPermiso.PendienteAprobacion && !permiso.fechaFirmaSupervisor) {
        permiso.fechaFirmaSupervisor = new Date();
      }
      if (dto.estado === EstadoPermiso.Aprobado && !permiso.fechaAprobacion) {
        permiso.fechaAprobacion = new Date();
      }
    }

    await this.permisoRepository.save(permiso);

    // Actualizar trabajadores
    if (dto.trabajadores) {
      await this.trabajadorPermisoRepository.delete({ permisoId: id });
      if (dto.trabajadores.length > 0) {
        const trabajadoresEntities = await Promise.all(
          dto.trabajadores.map(async (t) => {
            return this.trabajadorPermisoRepository.create({
              permisoId: id,
              trabajadorId: t.trabajador_id,
              nombreTrabajador: t.nombre,
              documentoTrabajador: t.documento,
              rol: t.rol ?? null,
              confirmadoLectura: false,
            });
          }),
        );
        await this.trabajadorPermisoRepository.save(trabajadoresEntities);
      }
    }

    return this.findOne(id);
  }

  validateEstadoTransition(
    estadoActual: EstadoPermiso,
    estadoNuevo: EstadoPermiso,
  ): void {
    const transicionesPermitidas: Record<EstadoPermiso, EstadoPermiso[]> = {
      [EstadoPermiso.Borrador]: [EstadoPermiso.PendienteAprobacion, EstadoPermiso.Cancelado],
      [EstadoPermiso.PendienteAprobacion]: [
        EstadoPermiso.Aprobado,
        EstadoPermiso.Cancelado,
      ],
      [EstadoPermiso.Aprobado]: [EstadoPermiso.EnEjecucion, EstadoPermiso.Cancelado],
      [EstadoPermiso.EnEjecucion]: [EstadoPermiso.Completado, EstadoPermiso.Cancelado],
      [EstadoPermiso.Completado]: [],
      [EstadoPermiso.Cancelado]: [],
    };

    const permitidos = transicionesPermitidas[estadoActual];
    if (!permitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`,
      );
    }
  }

  async confirmarLectura(
    permisoId: string,
    trabajadorId: string,
    firmaUrl?: string,
  ): Promise<void> {
    const trabajadorPermiso = await this.trabajadorPermisoRepository.findOne({
      where: { permisoId, trabajadorId },
    });

    if (!trabajadorPermiso) {
      throw new NotFoundException(
        `Trabajador no está asignado a este permiso`,
      );
    }

    if (trabajadorPermiso.confirmadoLectura) {
      throw new BadRequestException('Ya has confirmado la lectura de este permiso');
    }

    trabajadorPermiso.confirmadoLectura = true;
    trabajadorPermiso.fechaConfirmacion = new Date();
    if (firmaUrl) {
      trabajadorPermiso.firmaUrl = firmaUrl;
    }

    await this.trabajadorPermisoRepository.save(trabajadorPermiso);
  }

  async remove(id: string): Promise<void> {
    const permiso = await this.permisoRepository.findOne({ where: { id } });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    if (permiso.estado === EstadoPermiso.EnEjecucion) {
      throw new BadRequestException(
        'No se puede eliminar un permiso que está en ejecución',
      );
    }

    await this.permisoRepository.remove(permiso);
  }
}
