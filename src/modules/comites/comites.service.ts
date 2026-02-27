import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comite } from './entities/comite.entity';
import { MiembroComite } from './entities/miembro-comite.entity';
import { DocumentoComite } from './entities/documento-comite.entity';
import { ReunionComite } from './entities/reunion-comite.entity';
import { AcuerdoComite } from './entities/acuerdo-comite.entity';
import { AgendaReunion } from './entities/agenda-reunion.entity';
import { AcuerdoResponsable } from './entities/acuerdo-responsable.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CreateComiteDto } from './dto/create-comite.dto';
import { UpdateComiteDto } from './dto/update-comite.dto';
import { ResponseComiteDto } from './dto/response-comite.dto';
import { CreateMiembroComiteDto } from './dto/create-miembro-comite.dto';
import { ResponseMiembroComiteDto } from './dto/response-miembro-comite.dto';
import { CreateDocumentoComiteDto } from './dto/create-documento-comite.dto';
import { ResponseDocumentoComiteDto } from './dto/response-documento-comite.dto';
import { CreateReunionComiteDto } from './dto/create-reunion-comite.dto';
import { UpdateReunionComiteDto } from './dto/update-reunion-comite.dto';
import { ResponseReunionComiteDto } from './dto/response-reunion-comite.dto';
import { CreateAcuerdoComiteDto } from './dto/create-acuerdo-comite.dto';
import { UpdateAcuerdoComiteDto } from './dto/update-acuerdo-comite.dto';
import { ResponseAcuerdoComiteDto } from './dto/response-acuerdo-comite.dto';
import { ResponseAgendaReunionDto } from './dto/response-agenda-reunion.dto';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class ComitesService {
  constructor(
    @InjectRepository(Comite)
    private readonly comiteRepository: Repository<Comite>,
    @InjectRepository(MiembroComite)
    private readonly miembroComiteRepository: Repository<MiembroComite>,
    @InjectRepository(DocumentoComite)
    private readonly documentoComiteRepository: Repository<DocumentoComite>,
    @InjectRepository(ReunionComite)
    private readonly reunionComiteRepository: Repository<ReunionComite>,
    @InjectRepository(AcuerdoComite)
    private readonly acuerdoComiteRepository: Repository<AcuerdoComite>,
    @InjectRepository(AgendaReunion)
    private readonly agendaReunionRepository: Repository<AgendaReunion>,
    @InjectRepository(AcuerdoResponsable)
    private readonly acuerdoResponsableRepository: Repository<AcuerdoResponsable>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly usuariosService: UsuariosService,
  ) {}

  private async getUsuarioNombre(usuarioId: string): Promise<string> {
    const usuario = await this.usuariosService.findById(usuarioId);
    if (!usuario) return 'Sistema';
    const trabajador = usuario.trabajador as { nombreCompleto?: string } | undefined;
    if (trabajador?.nombreCompleto) return trabajador.nombreCompleto;
    const parts = [usuario.nombres, usuario.apellidoPaterno, usuario.apellidoMaterno].filter(Boolean);
    return parts.join(' ') || usuario.dni || 'Sistema';
  }

  async create(dto: CreateComiteDto, usuarioId?: string): Promise<ResponseComiteDto> {
    // Verificar que la empresa existe
    const empresa = await this.empresaRepository.findOne({
      where: { id: dto.empresa_id },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${dto.empresa_id} no encontrada`);
    }

    const registradoPorNombre = usuarioId ? await this.getUsuarioNombre(usuarioId) : null;

    const comite = this.comiteRepository.create({
      empresaId: dto.empresa_id,
      nombre: dto.nombre,
      fechaInicio: new Date(dto.fecha_inicio),
      fechaFin: new Date(dto.fecha_fin),
      descripcion: dto.descripcion ?? null,
      nroMiembros: dto.nro_miembros ?? 0,
      activo: dto.activo ?? true,
      registradoPorId: usuarioId ?? null,
      registradoPorNombre,
    });

    const saved = await this.comiteRepository.save(comite);
    return ResponseComiteDto.fromEntity(saved);
  }

  async findAll(empresaId?: string): Promise<ResponseComiteDto[]> {
    const where = empresaId ? { empresaId } : {};
    const comites = await this.comiteRepository.find({
      where,
      relations: ['miembros', 'miembros.trabajador'],
      order: { createdAt: 'DESC' },
      withDeleted: false,
    });
    return comites.map((comite) => ResponseComiteDto.fromEntity(comite));
  }

  async findOne(id: string): Promise<ResponseComiteDto> {
    const comite = await this.comiteRepository.findOne({
      where: { id },
      relations: ['miembros', 'miembros.trabajador'],
      withDeleted: false,
    });

    if (!comite) {
      throw new NotFoundException(`Comité con ID ${id} no encontrado`);
    }

    return ResponseComiteDto.fromEntity(comite);
  }

  async update(id: string, dto: UpdateComiteDto): Promise<ResponseComiteDto> {
    const comite = await this.comiteRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!comite) {
      throw new NotFoundException(`Comité con ID ${id} no encontrado`);
    }

    Object.assign(comite, {
      nombre: dto.nombre ?? comite.nombre,
      fechaInicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : comite.fechaInicio,
      fechaFin: dto.fecha_fin ? new Date(dto.fecha_fin) : comite.fechaFin,
      descripcion: dto.descripcion !== undefined ? dto.descripcion : comite.descripcion,
      nroMiembros: dto.nro_miembros !== undefined ? dto.nro_miembros : comite.nroMiembros,
      activo: dto.activo !== undefined ? dto.activo : comite.activo,
    });

    await this.comiteRepository.save(comite);
    return ResponseComiteDto.fromEntity(comite);
  }

  async remove(id: string): Promise<void> {
    const comite = await this.comiteRepository.findOne({
      where: { id },
      relations: ['miembros', 'documentos'],
      withDeleted: false,
    });

    if (!comite) {
      throw new NotFoundException(`Comité con ID ${id} no encontrado`);
    }

    // Soft delete del comité (los miembros y documentos se eliminarán en cascada si está configurado)
    await this.comiteRepository.softRemove(comite);
  }

  // Gestión de Miembros
  async agregarMiembro(
    comiteId: string,
    dto: CreateMiembroComiteDto,
  ): Promise<ResponseMiembroComiteDto> {
    // Verificar que el comité existe
    const comite = await this.comiteRepository.findOne({
      where: { id: comiteId },
      withDeleted: false,
    });

    if (!comite) {
      throw new NotFoundException(`Comité con ID ${comiteId} no encontrado`);
    }

    // Verificar que el trabajador existe
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: dto.trabajador_id },
      withDeleted: false,
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${dto.trabajador_id} no encontrado`);
    }

    // VALIDACIÓN CRÍTICA: Verificar que el trabajador pertenece a la misma empresa del comité
    if (trabajador.empresaId !== comite.empresaId) {
      throw new BadRequestException(
        `El trabajador no pertenece a la misma empresa del comité. Empresa del trabajador: ${trabajador.empresaId}, Empresa del comité: ${comite.empresaId}`,
      );
    }

    // Verificar si el trabajador ya es miembro de este comité (sin soft delete)
    const miembroExistente = await this.miembroComiteRepository.findOne({
      where: {
        comiteId: comiteId,
        trabajadorId: dto.trabajador_id,
      },
      withDeleted: false,
    });

    if (miembroExistente) {
      throw new ConflictException(
        'El trabajador ya es miembro de este comité',
      );
    }

    const miembro = this.miembroComiteRepository.create({
      comiteId: comiteId,
      trabajadorId: dto.trabajador_id,
      tipoMiembro: dto.tipo_miembro,
      rolComite: dto.rol_comite,
      representacion: dto.representacion,
    });

    const saved = await this.miembroComiteRepository.save(miembro);

    // Actualizar el contador de miembros del comité
    const countMiembros = await this.miembroComiteRepository.count({
      where: { comiteId: comiteId },
      withDeleted: false,
    });
    comite.nroMiembros = countMiembros;
    await this.comiteRepository.save(comite);

    // Cargar el trabajador para la respuesta
    const miembroConTrabajador = await this.miembroComiteRepository.findOne({
      where: { id: saved.id },
      relations: ['trabajador'],
      withDeleted: false,
    });

    return ResponseMiembroComiteDto.fromEntity(miembroConTrabajador!);
  }

  async quitarMiembro(miembroId: string): Promise<void> {
    const miembro = await this.miembroComiteRepository.findOne({
      where: { id: miembroId },
      relations: ['comite'],
      withDeleted: false,
    });

    if (!miembro) {
      throw new NotFoundException(`Miembro con ID ${miembroId} no encontrado`);
    }

    const comiteId = miembro.comiteId;

    // Soft delete del miembro
    await this.miembroComiteRepository.softRemove(miembro);

    // Actualizar el contador de miembros del comité
    const countMiembros = await this.miembroComiteRepository.count({
      where: { comiteId: comiteId },
      withDeleted: false,
    });
    const comite = await this.comiteRepository.findOne({
      where: { id: comiteId },
    });
    if (comite) {
      comite.nroMiembros = countMiembros;
      await this.comiteRepository.save(comite);
    }
  }

  async listarMiembros(comiteId: string): Promise<ResponseMiembroComiteDto[]> {
    // Verificar que el comité existe
    const comite = await this.comiteRepository.findOne({
      where: { id: comiteId },
      withDeleted: false,
    });

    if (!comite) {
      throw new NotFoundException(`Comité con ID ${comiteId} no encontrado`);
    }

    const miembros = await this.miembroComiteRepository.find({
      where: { comiteId: comiteId },
      relations: ['trabajador'],
      order: { createdAt: 'ASC' },
      withDeleted: false,
    });

    return miembros.map((miembro) => ResponseMiembroComiteDto.fromEntity(miembro));
  }

  // Gestión de Documentos
  async agregarDocumento(
    comiteId: string,
    dto: CreateDocumentoComiteDto,
  ): Promise<ResponseDocumentoComiteDto> {
    // Verificar que el comité existe
    const comite = await this.comiteRepository.findOne({
      where: { id: comiteId },
      withDeleted: false,
    });

    if (!comite) {
      throw new NotFoundException(`Comité con ID ${comiteId} no encontrado`);
    }

    const documento = this.documentoComiteRepository.create({
      comiteId: comiteId,
      titulo: dto.titulo,
      url: dto.url,
      fechaRegistro: dto.fecha_registro ? new Date(dto.fecha_registro) : new Date(),
    });

    const saved = await this.documentoComiteRepository.save(documento);
    return ResponseDocumentoComiteDto.fromEntity(saved);
  }

  async listarDocumentos(comiteId: string): Promise<ResponseDocumentoComiteDto[]> {
    // Verificar que el comité existe
    const comite = await this.comiteRepository.findOne({
      where: { id: comiteId },
      withDeleted: false,
    });

    if (!comite) {
      throw new NotFoundException(`Comité con ID ${comiteId} no encontrado`);
    }

    const documentos = await this.documentoComiteRepository.find({
      where: { comiteId: comiteId },
      order: { fechaRegistro: 'DESC' },
      withDeleted: false,
    });

    return documentos.map((documento) => ResponseDocumentoComiteDto.fromEntity(documento));
  }

  // Gestión de Reuniones
  async findAllReuniones(filters?: {
    comiteId?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    tipoReunion?: string;
    descripcion?: string;
  }): Promise<ResponseReunionComiteDto[]> {
    const queryBuilder = this.reunionComiteRepository
      .createQueryBuilder('reunion')
      .leftJoinAndSelect('reunion.acuerdos', 'acuerdos')
      .leftJoinAndSelect('reunion.comite', 'comite')
      .leftJoinAndSelect('reunion.agenda', 'agenda')
      .where('reunion.deletedAt IS NULL');

    if (filters?.comiteId) {
      queryBuilder.andWhere('reunion.comiteId = :comiteId', { comiteId: filters.comiteId });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('reunion.estado = :estado', { estado: filters.estado });
    }

    if (filters?.fechaDesde) {
      queryBuilder.andWhere('reunion.fechaRealizacion >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }

    if (filters?.fechaHasta) {
      queryBuilder.andWhere('reunion.fechaRealizacion <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    if (filters?.tipoReunion) {
      queryBuilder.andWhere('reunion.tipoReunion = :tipoReunion', {
        tipoReunion: filters.tipoReunion,
      });
    }

    if (filters?.descripcion) {
      queryBuilder.andWhere('reunion.descripcion ILIKE :descripcion', {
        descripcion: `%${filters.descripcion}%`,
      });
    }

    queryBuilder.orderBy('reunion.fechaRealizacion', 'DESC');

    const reuniones = await queryBuilder.getMany();
    return reuniones.map((reunion) => ResponseReunionComiteDto.fromEntity(reunion));
  }

  async findOneReunion(id: string): Promise<ResponseReunionComiteDto> {
    const reunion = await this.reunionComiteRepository.findOne({
      where: { id },
      relations: ['acuerdos', 'comite', 'agenda'],
      withDeleted: false,
    });

    if (!reunion) {
      throw new NotFoundException(`Reunión con ID ${id} no encontrada`);
    }

    return ResponseReunionComiteDto.fromEntity(reunion);
  }

  async createReunion(dto: CreateReunionComiteDto): Promise<ResponseReunionComiteDto[]> {
    // Verificar que todos los comités existen
    const comites = await this.comiteRepository.find({
      where: dto.comites_ids.map((id) => ({ id })),
      withDeleted: false,
    });

    if (comites.length !== dto.comites_ids.length) {
      const foundIds = comites.map((c) => c.id);
      const missingIds = dto.comites_ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Los siguientes comités no fueron encontrados: ${missingIds.join(', ')}`
      );
    }

    const reunionesCreadas: ResponseReunionComiteDto[] = [];

    // Crear una reunión para cada comité seleccionado
    for (const comiteId of dto.comites_ids) {
      const reunion = this.reunionComiteRepository.create({
        comiteId,
        sesion: dto.sesion,
        fechaRealizacion: new Date(dto.fecha_realizacion),
        horaRegistro: dto.hora_registro || null,
        lugar: dto.lugar || null,
        descripcion: dto.descripcion || null,
        estado: dto.estado || 'PENDIENTE' as any,
        tipoReunion: dto.tipo_reunion || 'ORDINARIA' as any,
        enviarAlerta: dto.enviar_alerta || false,
      });

      const saved = await this.reunionComiteRepository.save(reunion);

      // Crear los items de agenda si existen
      if (dto.agenda && dto.agenda.length > 0) {
        const agendaItems = dto.agenda.map((descripcion, index) =>
          this.agendaReunionRepository.create({
            reunionId: saved.id,
            descripcion: descripcion.trim(),
            orden: index,
          })
        );
        await this.agendaReunionRepository.save(agendaItems);
      }

      // Obtener la reunión completa con relaciones
      const reunionCompleta = await this.reunionComiteRepository.findOne({
        where: { id: saved.id },
        relations: ['acuerdos', 'comite', 'agenda'],
        withDeleted: false,
      });

      reunionesCreadas.push(ResponseReunionComiteDto.fromEntity(reunionCompleta!));
    }

    return reunionesCreadas;
  }

  async updateReunion(
    id: string,
    dto: UpdateReunionComiteDto,
  ): Promise<ResponseReunionComiteDto> {
    const reunion = await this.reunionComiteRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!reunion) {
      throw new NotFoundException(`Reunión con ID ${id} no encontrada`);
    }

    Object.assign(reunion, {
      sesion: dto.sesion ?? reunion.sesion,
      fechaRealizacion: dto.fecha_realizacion ? new Date(dto.fecha_realizacion) : reunion.fechaRealizacion,
      horaRegistro: dto.hora_registro !== undefined ? dto.hora_registro : reunion.horaRegistro,
      lugar: dto.lugar !== undefined ? dto.lugar : reunion.lugar,
      descripcion: dto.descripcion !== undefined ? dto.descripcion : reunion.descripcion,
      estado: dto.estado ?? reunion.estado,
      tipoReunion: dto.tipo_reunion ?? reunion.tipoReunion,
      enviarAlerta: dto.enviar_alerta !== undefined ? dto.enviar_alerta : reunion.enviarAlerta,
    });

    await this.reunionComiteRepository.save(reunion);

    // Actualizar agenda si se proporciona
    if (dto.agenda !== undefined) {
      // Eliminar agenda existente
      await this.agendaReunionRepository.softDelete({ reunionId: id });

      // Crear nueva agenda
      if (dto.agenda.length > 0) {
        const agendaItems = dto.agenda.map((descripcion, index) =>
          this.agendaReunionRepository.create({
            reunionId: id,
            descripcion: descripcion.trim(),
            orden: index,
          })
        );
        await this.agendaReunionRepository.save(agendaItems);
      }
    }

    const updated = await this.reunionComiteRepository.findOne({
      where: { id },
      relations: ['acuerdos', 'comite', 'agenda'],
      withDeleted: false,
    });

    return ResponseReunionComiteDto.fromEntity(updated!);
  }

  async removeReunion(id: string): Promise<void> {
    const reunion = await this.reunionComiteRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!reunion) {
      throw new NotFoundException(`Reunión con ID ${id} no encontrada`);
    }

    await this.reunionComiteRepository.softRemove(reunion);
  }

  // Gestión de Acuerdos
  async findAllAcuerdos(filters?: {
    reunionId?: string;
    comiteId?: string;
    responsableId?: string;
    estado?: string;
    tipoAcuerdo?: string;
    titulo?: string;
  }): Promise<ResponseAcuerdoComiteDto[]> {
    const queryBuilder = this.acuerdoComiteRepository
      .createQueryBuilder('acuerdo')
      .leftJoinAndSelect('acuerdo.reunion', 'reunion')
      .leftJoinAndSelect('acuerdo.responsables', 'ar')
      .leftJoinAndSelect('ar.responsable', 'responsable')
      .leftJoinAndSelect('responsable.area', 'area')
      .where('acuerdo.deletedAt IS NULL');

    if (filters?.reunionId) {
      queryBuilder.andWhere('acuerdo.reunionId = :reunionId', { reunionId: filters.reunionId });
    }

    if (filters?.comiteId) {
      queryBuilder.andWhere('reunion.comiteId = :comiteId', { comiteId: filters.comiteId });
    }

    if (filters?.responsableId) {
      queryBuilder.andWhere('ar.responsableId = :responsableId', {
        responsableId: filters.responsableId,
      });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('acuerdo.estado = :estado', { estado: filters.estado });
    }

    if (filters?.tipoAcuerdo) {
      queryBuilder.andWhere('acuerdo.tipoAcuerdo = :tipoAcuerdo', {
        tipoAcuerdo: filters.tipoAcuerdo,
      });
    }

    if (filters?.titulo) {
      queryBuilder.andWhere('acuerdo.titulo ILIKE :titulo', {
        titulo: `%${filters.titulo}%`,
      });
    }

    queryBuilder.orderBy('acuerdo.fechaProgramada', 'ASC');

    const acuerdos = await queryBuilder.getMany();
    return acuerdos.map((acuerdo) => ResponseAcuerdoComiteDto.fromEntity(acuerdo));
  }

  async findOneAcuerdo(id: string): Promise<ResponseAcuerdoComiteDto> {
    const acuerdo = await this.acuerdoComiteRepository.findOne({
      where: { id },
      relations: ['responsables', 'responsables.responsable', 'responsables.responsable.area', 'reunion'],
      withDeleted: false,
    });

    if (!acuerdo) {
      throw new NotFoundException(`Acuerdo con ID ${id} no encontrado`);
    }

    return ResponseAcuerdoComiteDto.fromEntity(acuerdo);
  }

  async createAcuerdo(dto: CreateAcuerdoComiteDto): Promise<ResponseAcuerdoComiteDto> {
    // Verificar que la reunión existe
    const reunion = await this.reunionComiteRepository.findOne({
      where: { id: dto.reunion_id },
      withDeleted: false,
    });

    if (!reunion) {
      throw new NotFoundException(`Reunión con ID ${dto.reunion_id} no encontrada`);
    }

    // Verificar que todos los responsables existen
    const responsables = await this.trabajadorRepository.find({
      where: dto.responsables_ids.map((id) => ({ id })),
      withDeleted: false,
    });

    if (responsables.length !== dto.responsables_ids.length) {
      const foundIds = responsables.map((r) => r.id);
      const missingIds = dto.responsables_ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Los siguientes trabajadores no fueron encontrados: ${missingIds.join(', ')}`
      );
    }

    const acuerdo = this.acuerdoComiteRepository.create({
      reunionId: dto.reunion_id,
      titulo: dto.titulo,
      descripcion: dto.descripcion || null,
      tipoAcuerdo: dto.tipo_acuerdo || 'CON_SEGUIMIENTO' as any,
      fechaProgramada: dto.fecha_programada ? new Date(dto.fecha_programada) : null,
      fechaReal: dto.fecha_real ? new Date(dto.fecha_real) : null,
      estado: dto.estado || 'PENDIENTE' as any,
      observaciones: dto.observaciones || null,
    });

    const saved = await this.acuerdoComiteRepository.save(acuerdo);

    // Crear relaciones con responsables
    const acuerdoResponsables = dto.responsables_ids.map((responsableId) =>
      this.acuerdoResponsableRepository.create({
        acuerdoId: saved.id,
        responsableId,
      })
    );
    await this.acuerdoResponsableRepository.save(acuerdoResponsables);

    const acuerdoConRelaciones = await this.acuerdoComiteRepository.findOne({
      where: { id: saved.id },
      relations: ['responsables', 'responsables.responsable', 'responsables.responsable.area', 'reunion'],
      withDeleted: false,
    });

    return ResponseAcuerdoComiteDto.fromEntity(acuerdoConRelaciones!);
  }

  async updateAcuerdo(
    id: string,
    dto: UpdateAcuerdoComiteDto,
  ): Promise<ResponseAcuerdoComiteDto> {
    const acuerdo = await this.acuerdoComiteRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!acuerdo) {
      throw new NotFoundException(`Acuerdo con ID ${id} no encontrado`);
    }

    // Si se actualizan los responsables, verificar que existen
    if (dto.responsables_ids && dto.responsables_ids.length > 0) {
      const responsables = await this.trabajadorRepository.find({
        where: dto.responsables_ids.map((responsableId) => ({ id: responsableId })),
        withDeleted: false,
      });

      if (responsables.length !== dto.responsables_ids.length) {
        const foundIds = responsables.map((r) => r.id);
        const missingIds = dto.responsables_ids.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Los siguientes trabajadores no fueron encontrados: ${missingIds.join(', ')}`
        );
      }

      // Eliminar relaciones existentes
      await this.acuerdoResponsableRepository.delete({ acuerdoId: id });

      // Crear nuevas relaciones
      const acuerdoResponsables = dto.responsables_ids.map((responsableId) =>
        this.acuerdoResponsableRepository.create({
          acuerdoId: id,
          responsableId,
        })
      );
      await this.acuerdoResponsableRepository.save(acuerdoResponsables);
    }

    Object.assign(acuerdo, {
      titulo: dto.titulo ?? acuerdo.titulo,
      descripcion: dto.descripcion !== undefined ? dto.descripcion : acuerdo.descripcion,
      tipoAcuerdo: dto.tipo_acuerdo ?? acuerdo.tipoAcuerdo,
      fechaProgramada: dto.fecha_programada ? new Date(dto.fecha_programada) : acuerdo.fechaProgramada,
      fechaReal: dto.fecha_real ? new Date(dto.fecha_real) : acuerdo.fechaReal,
      estado: dto.estado ?? acuerdo.estado,
      observaciones: dto.observaciones !== undefined ? dto.observaciones : acuerdo.observaciones,
    });

    await this.acuerdoComiteRepository.save(acuerdo);
    const updated = await this.acuerdoComiteRepository.findOne({
      where: { id },
      relations: ['responsables', 'responsables.responsable', 'responsables.responsable.area', 'reunion'],
      withDeleted: false,
    });

    return ResponseAcuerdoComiteDto.fromEntity(updated!);
  }

  async removeAcuerdo(id: string): Promise<void> {
    const acuerdo = await this.acuerdoComiteRepository.findOne({
      where: { id },
      withDeleted: false,
    });

    if (!acuerdo) {
      throw new NotFoundException(`Acuerdo con ID ${id} no encontrado`);
    }

    await this.acuerdoComiteRepository.softRemove(acuerdo);
  }
}
