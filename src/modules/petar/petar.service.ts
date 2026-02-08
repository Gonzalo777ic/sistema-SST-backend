import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PETAR, EstadoPETAR } from './entities/petar.entity';
import { PetarTrabajador } from './entities/petar-trabajador.entity';
import { CreatePetarDto } from './dto/create-petar.dto';
import { UpdatePetarDto } from './dto/update-petar.dto';
import { ResponsePetarDto } from './dto/response-petar.dto';

@Injectable()
export class PetarService {
  constructor(
    @InjectRepository(PETAR)
    private readonly petarRepository: Repository<PETAR>,
    @InjectRepository(PetarTrabajador)
    private readonly trabajadorRepository: Repository<PetarTrabajador>,
  ) {}

  async generateCodigo(): Promise<string> {
    const timestamp = Date.now();
    return `PETAR-${timestamp}`;
  }

  validateChecklist(checklist: Array<{ cumple: boolean }>): boolean {
    if (!checklist || checklist.length === 0) return false;
    return checklist.every((item) => item.cumple === true);
  }

  validateCondicionesPrevias(
    condiciones: Array<{ verificado: boolean }>,
  ): boolean {
    if (!condiciones || condiciones.length === 0) return true;
    return condiciones.every((cond) => cond.verificado === true);
  }

  validateFechaFinAfterInicio(fechaInicio: Date, fechaFin: Date): boolean {
    return fechaFin > fechaInicio;
  }

  async create(dto: CreatePetarDto): Promise<ResponsePetarDto> {
    const codigo = dto.codigo || (await this.generateCodigo());

    // Verificar unicidad del código
    const existing = await this.petarRepository.findOne({
      where: { codigo },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un PETAR con el código ${codigo}`);
    }

    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaFin = new Date(dto.fecha_fin);

    // Validar fechas
    if (!this.validateFechaFinAfterInicio(fechaInicio, fechaFin)) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar duración máxima (24 horas)
    const diffHours = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) {
      throw new BadRequestException(
        'Un PETAR no puede durar más de 24 horas',
      );
    }

    const petar = this.petarRepository.create({
      codigo,
      tipoTrabajo: dto.tipo_trabajo,
      descripcionTarea: dto.descripcion_tarea,
      area: dto.area,
      fechaInicio,
      fechaFin,
      equiposHerramientas: dto.equipos_herramientas ?? null,
      eppRequerido: dto.epp_requerido ?? null,
      condicionesPrevias: dto.condiciones_previas ?? null,
      checklistVerificacion: dto.checklist_verificacion ?? null,
      peligros: dto.peligros ?? null,
      observaciones: dto.observaciones ?? null,
      supervisorResponsableId: dto.supervisor_responsable_id,
      empresaContratistaId: dto.empresa_contratista_id ?? null,
      firmaSupervisorUrl: dto.firma_supervisor_url ?? null,
      estado: dto.estado ?? EstadoPETAR.Borrador,
      empresaId: dto.empresa_id,
      creadoPorId: dto.creado_por_id,
    });

    const savedPetar = await this.petarRepository.save(petar);

    // Guardar trabajadores
    if (dto.trabajadores && dto.trabajadores.length > 0) {
      const trabajadoresEntities = dto.trabajadores.map((t) =>
        this.trabajadorRepository.create({
          petarId: savedPetar.id,
          trabajadorId: t.trabajador_id ?? null,
          nombreSnapshot: t.nombre,
          documentoSnapshot: t.documento,
          emailSnapshot: t.email ?? null,
          confirmado: false,
        }),
      );
      await this.trabajadorRepository.save(trabajadoresEntities);
    }

    return this.findOne(savedPetar.id);
  }

  async findAll(empresaId?: string): Promise<ResponsePetarDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const petarList = await this.petarRepository.find({
      where,
      relations: [
        'supervisorResponsable',
        'aprobadorSst',
        'trabajadores',
      ],
      order: { createdAt: 'DESC' },
    });

    return petarList.map((petar) => ResponsePetarDto.fromEntity(petar));
  }

  async findOne(id: string): Promise<ResponsePetarDto> {
    const petar = await this.petarRepository.findOne({
      where: { id },
      relations: [
        'supervisorResponsable',
        'aprobadorSst',
        'trabajadores',
      ],
    });

    if (!petar) {
      throw new NotFoundException(`PETAR con ID ${id} no encontrado`);
    }

    return ResponsePetarDto.fromEntity(petar);
  }

  async update(id: string, dto: UpdatePetarDto): Promise<ResponsePetarDto> {
    const petar = await this.petarRepository.findOne({
      where: { id },
      relations: ['trabajadores'],
    });

    if (!petar) {
      throw new NotFoundException(`PETAR con ID ${id} no encontrado`);
    }

    // Validar transiciones de estado
    if (dto.estado && dto.estado !== petar.estado) {
      this.validateEstadoTransition(petar.estado, dto.estado, petar);
    }

    // Actualizar campos
    if (dto.tipo_trabajo) petar.tipoTrabajo = dto.tipo_trabajo;
    if (dto.descripcion_tarea) petar.descripcionTarea = dto.descripcion_tarea;
    if (dto.area) petar.area = dto.area;
    if (dto.fecha_inicio) petar.fechaInicio = new Date(dto.fecha_inicio);
    if (dto.fecha_fin) petar.fechaFin = new Date(dto.fecha_fin);
    if (dto.equipos_herramientas !== undefined)
      petar.equiposHerramientas = dto.equipos_herramientas;
    if (dto.epp_requerido !== undefined) petar.eppRequerido = dto.epp_requerido;
    if (dto.condiciones_previas !== undefined)
      petar.condicionesPrevias = dto.condiciones_previas;
    if (dto.checklist_verificacion !== undefined) {
      petar.checklistVerificacion = dto.checklist_verificacion.map(item => ({
        ...item,
        observacion: item.observacion ?? '' 
      }));
    }
    if (dto.peligros !== undefined) petar.peligros = dto.peligros;
    if (dto.observaciones !== undefined) petar.observaciones = dto.observaciones;
    if (dto.supervisor_responsable_id !== undefined)
      petar.supervisorResponsableId = dto.supervisor_responsable_id;
    if (dto.empresa_contratista_id !== undefined)
      petar.empresaContratistaId = dto.empresa_contratista_id;
    if (dto.firma_supervisor_url !== undefined)
      petar.firmaSupervisorUrl = dto.firma_supervisor_url;
    if (dto.firma_sst_url !== undefined) petar.firmaSstUrl = dto.firma_sst_url;
    if (dto.aprobador_sst !== undefined) {
      petar.aprobadorSstId = dto.aprobador_sst;
    }

    if (dto.estado) {
      petar.estado = dto.estado;

      // Actualizar fechas de firma según el estado
      if (dto.estado === EstadoPETAR.PendienteAprobacion && !petar.fechaFirmaSupervisor) {
        petar.fechaFirmaSupervisor = new Date();
      }
      if (dto.estado === EstadoPETAR.Aprobado && !petar.fechaFirmaSst) {
        petar.fechaFirmaSst = new Date();
      }
    }

    await this.petarRepository.save(petar);

    // Actualizar trabajadores
    if (dto.trabajadores) {
      await this.trabajadorRepository.delete({ petarId: id });
      if (dto.trabajadores.length > 0) {
        const trabajadoresEntities = dto.trabajadores.map((t) =>
          this.trabajadorRepository.create({
            petarId: id,
            trabajadorId: t.trabajador_id ?? null,
            nombreSnapshot: t.nombre,
            documentoSnapshot: t.documento,
            emailSnapshot: t.email ?? null,
            confirmado: false,
          }),
        );
        await this.trabajadorRepository.save(trabajadoresEntities);
      }
    }

    return this.findOne(id);
  }

  validateEstadoTransition(
    estadoActual: EstadoPETAR,
    estadoNuevo: EstadoPETAR,
    petar: PETAR,
  ): void {
    // Validar transiciones permitidas
    const transicionesPermitidas: Record<EstadoPETAR, EstadoPETAR[]> = {
      [EstadoPETAR.Borrador]: [
        EstadoPETAR.PendienteAprobacion,
        EstadoPETAR.Anulado,
      ],
      [EstadoPETAR.PendienteAprobacion]: [
        EstadoPETAR.Aprobado,
        EstadoPETAR.Anulado,
      ],
      [EstadoPETAR.Aprobado]: [
        EstadoPETAR.EnEjecucion,
        EstadoPETAR.Anulado,
      ],
      [EstadoPETAR.EnEjecucion]: [EstadoPETAR.Cerrado],
      [EstadoPETAR.Cerrado]: [],
      [EstadoPETAR.Anulado]: [],
    };

    const permitidos = transicionesPermitidas[estadoActual];
    if (!permitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `No se puede cambiar de ${estadoActual} a ${estadoNuevo}`,
      );
    }

    // Validaciones específicas
    if (
      estadoNuevo === EstadoPETAR.PendienteAprobacion &&
      petar.checklistVerificacion
    ) {
      if (!this.validateChecklist(petar.checklistVerificacion)) {
        throw new BadRequestException(
          'Todos los ítems del checklist deben estar cumplidos',
        );
      }
    }

    if (
      estadoNuevo === EstadoPETAR.Aprobado &&
      petar.condicionesPrevias
    ) {
      if (!this.validateCondicionesPrevias(petar.condicionesPrevias)) {
        throw new BadRequestException(
          'Todas las condiciones previas deben estar verificadas',
        );
      }
    }
  }

  async remove(id: string): Promise<void> {
    const petar = await this.petarRepository.findOne({ where: { id } });

    if (!petar) {
      throw new NotFoundException(`PETAR con ID ${id} no encontrado`);
    }

    if (petar.estado === EstadoPETAR.Cerrado) {
      throw new BadRequestException(
        'No se puede eliminar un PETAR que está Cerrado',
      );
    }

    await this.petarRepository.remove(petar);
  }
}
