import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ATS, EstadoATS } from './entities/ats.entity';
import { AtsPersonalInvolucrado } from './entities/ats-personal-involucrado.entity';
import { AtsPasoTrabajo } from './entities/ats-paso-trabajo.entity';
import { CreateAtsDto } from './dto/create-ats.dto';
import { UpdateAtsDto } from './dto/update-ats.dto';
import { ResponseAtsDto } from './dto/response-ats.dto';

@Injectable()
export class AtsService {
  constructor(
    @InjectRepository(ATS)
    private readonly atsRepository: Repository<ATS>,
    @InjectRepository(AtsPersonalInvolucrado)
    private readonly personalRepository: Repository<AtsPersonalInvolucrado>,
    @InjectRepository(AtsPasoTrabajo)
    private readonly pasosRepository: Repository<AtsPasoTrabajo>,
  ) {}

  async generateNumeroAts(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ATS-${year}-`;
    const existing = await this.atsRepository
      .createQueryBuilder('ats')
      .where('ats.numero_ats LIKE :prefix', { prefix: `${prefix}%` })
      .getCount();
    return `${prefix}${String(existing + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateAtsDto): Promise<ResponseAtsDto> {
    const numeroAts =
      dto.numero_ats || (await this.generateNumeroAts());

    // Verificar unicidad del número ATS
    const existing = await this.atsRepository.findOne({
      where: { numeroAts },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un ATS con el número ${numeroAts}`,
      );
    }

    const ats = this.atsRepository.create({
      numeroAts,
      fecha: new Date(dto.fecha),
      area: dto.area,
      ubicacion: dto.ubicacion ?? null,
      trabajoARealizar: dto.trabajo_a_realizar,
      horaInicio: dto.hora_inicio ?? null,
      horaFin: dto.hora_fin ?? null,
      herramientasEquipos: dto.herramientas_equipos ?? null,
      condicionesClimaticas: dto.condiciones_climaticas ?? null,
      observaciones: dto.observaciones ?? null,
      eppRequerido: dto.epp_requerido ?? null,
      trabajoAltura: dto.permisos_especiales?.trabajo_altura ?? false,
      trabajoCaliente: dto.permisos_especiales?.trabajo_caliente ?? false,
      espacioConfinado: dto.permisos_especiales?.espacio_confinado ?? false,
      excavacion: dto.permisos_especiales?.excavacion ?? false,
      energiaElectrica: dto.permisos_especiales?.energia_electrica ?? false,
      firmaElaborador: dto.firma_elaborador ?? null,
      firmaSupervisorUrl: dto.firma_supervisor_url ?? null,
      estado: dto.estado ?? EstadoATS.Borrador,
      empresaId: dto.empresa_id,
      elaboradoPorId: dto.elaborado_por_id,
      supervisorId: dto.supervisor_id ?? null,
      historialVersiones: [
        {
          version: 1,
          fecha: new Date().toISOString(),
          usuario: dto.elaborado_por || 'Sistema',
          accion: 'Creado',
          estado_anterior: null,
          estado_nuevo: EstadoATS.Borrador,
        },
      ],
    });

    const savedAts = await this.atsRepository.save(ats);

    // Guardar personal involucrado
    if (dto.personal_involucrado && dto.personal_involucrado.length > 0) {
      const personalEntities = dto.personal_involucrado.map((p) =>
        this.personalRepository.create({
          atsId: savedAts.id,
          nombre: p.nombre,
          documento: p.documento,
          firmaUrl: p.firma_url ?? null,
        }),
      );
      await this.personalRepository.save(personalEntities);
    }

    // Guardar pasos de trabajo
    if (dto.pasos_trabajo && dto.pasos_trabajo.length > 0) {
      const pasosEntities = dto.pasos_trabajo.map((p) =>
        this.pasosRepository.create({
          atsId: savedAts.id,
          numero: p.numero,
          pasoTarea: p.paso_tarea,
          peligrosRiesgos: p.peligros_riesgos,
          medidasControl: p.medidas_control,
          responsable: p.responsable ?? null,
        }),
      );
      await this.pasosRepository.save(pasosEntities);
    }

    return this.findOne(savedAts.id);
  }

  async findAll(empresaId?: string): Promise<ResponseAtsDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const atsList = await this.atsRepository.find({
      where,
      relations: ['elaboradoPor', 'supervisor', 'aprobadoPor', 'personalInvolucrado', 'pasosTrabajo'],
      order: { createdAt: 'DESC' },
    });

    return atsList.map((ats) => ResponseAtsDto.fromEntity(ats));
  }

  async findOne(id: string): Promise<ResponseAtsDto> {
    const ats = await this.atsRepository.findOne({
      where: { id },
      relations: ['elaboradoPor', 'supervisor', 'aprobadoPor', 'personalInvolucrado', 'pasosTrabajo'],
    });

    if (!ats) {
      throw new NotFoundException(`ATS con ID ${id} no encontrado`);
    }

    return ResponseAtsDto.fromEntity(ats);
  }

  async update(id: string, dto: UpdateAtsDto): Promise<ResponseAtsDto> {
    const ats = await this.atsRepository.findOne({
      where: { id },
      relations: ['personalInvolucrado', 'pasosTrabajo'],
    });

    if (!ats) {
      throw new NotFoundException(`ATS con ID ${id} no encontrado`);
    }

    // Validar que no se pueda editar si está Finalizado
    if (ats.estado === EstadoATS.Finalizado) {
      throw new BadRequestException(
        'No se puede editar un ATS que está en estado Finalizado',
      );
    }

    // Validar que solo se pueda editar en Borrador
    if (ats.estado !== EstadoATS.Borrador && dto.estado !== ats.estado) {
      throw new BadRequestException(
        'Solo se pueden editar ATS en estado Borrador',
      );
    }

    // Actualizar campos principales
    if (dto.fecha) ats.fecha = new Date(dto.fecha);
    if (dto.area) ats.area = dto.area;
    if (dto.ubicacion !== undefined) ats.ubicacion = dto.ubicacion;
    if (dto.trabajo_a_realizar) ats.trabajoARealizar = dto.trabajo_a_realizar;
    if (dto.hora_inicio !== undefined) ats.horaInicio = dto.hora_inicio;
    if (dto.hora_fin !== undefined) ats.horaFin = dto.hora_fin;
    if (dto.herramientas_equipos !== undefined)
      ats.herramientasEquipos = dto.herramientas_equipos;
    if (dto.condiciones_climaticas !== undefined)
      ats.condicionesClimaticas = dto.condiciones_climaticas;
    if (dto.observaciones !== undefined) ats.observaciones = dto.observaciones;
    if (dto.epp_requerido !== undefined) ats.eppRequerido = dto.epp_requerido;
    if (dto.firma_elaborador !== undefined)
      ats.firmaElaborador = dto.firma_elaborador;
    if (dto.firma_supervisor_url !== undefined)
      ats.firmaSupervisorUrl = dto.firma_supervisor_url;
    if (dto.supervisor_id !== undefined) ats.supervisorId = dto.supervisor_id;

    if (dto.permisos_especiales) {
      if (dto.permisos_especiales.trabajo_altura !== undefined)
        ats.trabajoAltura = dto.permisos_especiales.trabajo_altura;
      if (dto.permisos_especiales.trabajo_caliente !== undefined)
        ats.trabajoCaliente = dto.permisos_especiales.trabajo_caliente;
      if (dto.permisos_especiales.espacio_confinado !== undefined)
        ats.espacioConfinado = dto.permisos_especiales.espacio_confinado;
      if (dto.permisos_especiales.excavacion !== undefined)
        ats.excavacion = dto.permisos_especiales.excavacion;
      if (dto.permisos_especiales.energia_electrica !== undefined)
        ats.energiaElectrica = dto.permisos_especiales.energia_electrica;
    }

    // Manejar cambio de estado
    if (dto.estado && dto.estado !== ats.estado) {
      const historial = ats.historialVersiones || [];
      historial.push({
        version: historial.length + 1,
        fecha: new Date().toISOString(),
        usuario: 'Sistema',
        accion: 'Cambio de estado',
        estado_anterior: ats.estado,
        estado_nuevo: dto.estado,
      });
      ats.historialVersiones = historial;
      ats.estado = dto.estado;

      if (dto.estado === EstadoATS.Aprobado) {
        ats.fechaAprobacion = new Date();
      }
    }

    await this.atsRepository.save(ats);

    // Actualizar personal involucrado
    if (dto.personal_involucrado) {
      await this.personalRepository.delete({ atsId: id });
      if (dto.personal_involucrado.length > 0) {
        const personalEntities = dto.personal_involucrado.map((p) =>
          this.personalRepository.create({
            atsId: id,
            nombre: p.nombre,
            documento: p.documento,
            firmaUrl: p.firma_url ?? null,
          }),
        );
        await this.personalRepository.save(personalEntities);
      }
    }

    // Actualizar pasos de trabajo
    if (dto.pasos_trabajo) {
      await this.pasosRepository.delete({ atsId: id });
      if (dto.pasos_trabajo.length > 0) {
        const pasosEntities = dto.pasos_trabajo.map((p) =>
          this.pasosRepository.create({
            atsId: id,
            numero: p.numero,
            pasoTarea: p.paso_tarea,
            peligrosRiesgos: p.peligros_riesgos,
            medidasControl: p.medidas_control,
            responsable: p.responsable ?? null,
          }),
        );
        await this.pasosRepository.save(pasosEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const ats = await this.atsRepository.findOne({ where: { id } });

    if (!ats) {
      throw new NotFoundException(`ATS con ID ${id} no encontrado`);
    }

    if (ats.estado === EstadoATS.Finalizado) {
      throw new BadRequestException(
        'No se puede eliminar un ATS que está en estado Finalizado',
      );
    }

    await this.atsRepository.remove(ats);
  }
}
