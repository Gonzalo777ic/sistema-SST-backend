import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SolicitudEPP,
  EstadoSolicitudEPP,
} from './entities/solicitud-epp.entity';
import { SolicitudEPPDetalle } from './entities/solicitud-epp-detalle.entity';
import { EPP, CategoriaCriticidadEPP, VigenciaEPP } from './entities/epp.entity';
import { CreateSolicitudEppDto } from './dto/create-solicitud-epp.dto';
import { UpdateSolicitudEppDto } from './dto/update-solicitud-epp.dto';
import { ResponseSolicitudEppDto } from './dto/response-solicitud-epp.dto';
import { CreateEppDto } from './dto/create-epp.dto';
import { UpdateEppDto } from './dto/update-epp.dto';
import { ResponseEppDto } from './dto/response-epp.dto';
import { CategoriaEPP } from './entities/epp.entity';
import { ResponseKardexDto } from './dto/response-kardex.dto';
import {
  ResponseKardexListItemDto,
  EstadoVigenciaKardex,
} from './dto/response-kardex-list.dto';
import {
  ReporteEstadosEppDto,
  ReporteEntregasPorEmpresaDto,
  ReporteEntregasPorEmpresaAreaDto,
  ReporteEntregasPorMesDto,
  ReporteEntregasPorSedeDto,
  ReporteEppsMasSolicitadosDto,
  ReporteTrabajadorCostoDto,
} from './dto/reporte-epp.dto';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { TrabajadorEppFavorito } from './entities/trabajador-epp-favorito.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ConfigEppService } from '../config-epp/config-epp.service';
import { EppPdfService } from './epp-pdf.service';
import { StorageService } from '../../common/services/storage.service';
import { validateSignatureOrThrow } from '../../common/utils/signature-validation';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EVENTO_NOTIFICACION_CREAR,
  PayloadNotificacionCrear,
} from '../notificaciones/notificaciones.service';

/** Copia datos del EPP al detalle para consistencia histórica (snapshot) */
function snapshotEppToDetalle(epp: EPP | null): {
  eppNombreHistorico: string | null;
  eppTipoProteccionHistorico: string | null;
  eppCategoriaHistorica: string | null;
  eppDescripcionHistorica: string | null;
  eppVigenciaHistorica: string | null;
  eppImagenUrlHistorica: string | null;
} {
  if (!epp) {
    return {
      eppNombreHistorico: null,
      eppTipoProteccionHistorico: null,
      eppCategoriaHistorica: null,
      eppDescripcionHistorica: null,
      eppVigenciaHistorica: null,
      eppImagenUrlHistorica: null,
    };
  }
  return {
    eppNombreHistorico: epp.nombre ?? null,
    eppTipoProteccionHistorico: epp.tipoProteccion ?? null,
    eppCategoriaHistorica: epp.categoria ?? null,
    eppDescripcionHistorica: epp.descripcion ?? null,
    eppVigenciaHistorica: epp.vigencia ?? null,
    eppImagenUrlHistorica: epp.imagenUrl ?? null,
  };
}

function vigenciaToMonths(vigencia: VigenciaEPP | null): number {
  if (!vigencia) return 0;
  const map: Record<string, number> = {
    '1 mes': 1,
    '2 meses': 2,
    '3 meses': 3,
    '4 meses': 4,
    '5 meses': 5,
    '6 meses': 6,
    '7 meses': 7,
    '8 meses': 8,
    '9 meses': 9,
    '10 meses': 10,
    '11 meses': 11,
    '1 año': 12,
    '2 años': 24,
  };
  return map[vigencia] ?? 0;
}

@Injectable()
export class EppService {
  constructor(
    @InjectRepository(SolicitudEPP)
    private readonly solicitudRepository: Repository<SolicitudEPP>,
    @InjectRepository(SolicitudEPPDetalle)
    private readonly detalleRepository: Repository<SolicitudEPPDetalle>,
    @InjectRepository(EPP)
    private readonly eppRepository: Repository<EPP>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(TrabajadorEppFavorito)
    private readonly favoritoRepository: Repository<TrabajadorEppFavorito>,
    private readonly configEppService: ConfigEppService,
    private readonly eppPdfService: EppPdfService,
    private readonly storageService: StorageService,
    private readonly usuariosService: UsuariosService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ========== CRUD EPP (Catálogo) ==========

  async uploadEppImagen(empresaId: string | null | undefined, buffer: Buffer, mimetype: string): Promise<string> {
    if (!this.storageService.isAvailable()) {
      throw new BadRequestException('El almacenamiento en la nube no está configurado. Use la opción de URL.');
    }
    let ruc = 'sistema';
    if (empresaId?.trim()) {
      const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
      if (!empresa) throw new NotFoundException('Empresa no encontrada');
      ruc = (empresa as any).ruc?.replace(/[^a-zA-Z0-9]/g, '_') ?? 'sistema';
    }
    try {
      return await this.storageService.uploadFile(ruc, buffer, 'imagen_epp', { contentType: mimetype });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Error al subir imagen';
      if (msg.includes('billing') || msg.includes('delinquent') || err?.response?.status === 403) {
        throw new BadRequestException(
          'No se pudo subir la imagen: la cuenta de facturación de Google Cloud está deshabilitada. Use la opción "ingresar URL de imagen" para vincular una imagen externa.',
        );
      }
      throw new BadRequestException(`Error al subir imagen: ${msg}`);
    }
  }

  async uploadEppFichaPdf(empresaId: string | null | undefined, buffer: Buffer): Promise<string> {
    if (!this.storageService.isAvailable()) {
      throw new BadRequestException('El almacenamiento en la nube no está configurado. Use la opción de URL.');
    }
    let ruc = 'sistema';
    if (empresaId?.trim()) {
      const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
      if (!empresa) throw new NotFoundException('Empresa no encontrada');
      ruc = (empresa as any).ruc?.replace(/[^a-zA-Z0-9]/g, '_') ?? 'sistema';
    }
    try {
      return await this.storageService.uploadFile(ruc, buffer, 'ficha_pdf_epp', { contentType: 'application/pdf' });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Error al subir PDF';
      if (msg.includes('billing') || msg.includes('delinquent') || err?.response?.status === 403) {
        throw new BadRequestException(
          'No se pudo subir el PDF: la cuenta de facturación de Google Cloud está deshabilitada. Use la opción "ingresar URL del PDF" para vincular un documento externo.',
        );
      }
      throw new BadRequestException(`Error al subir PDF: ${msg}`);
    }
  }

  async createEpp(dto: CreateEppDto): Promise<ResponseEppDto> {
    const epp = this.eppRepository.create({
      nombre: dto.nombre,
      tipoProteccion: dto.tipo_proteccion,
      categoria: dto.categoria ?? CategoriaEPP.EPP,
      descripcion: dto.descripcion ?? null,
      imagenUrl: dto.imagen_url ?? null,
      vigencia: dto.vigencia ?? null,
      costo: dto.costo ?? null,
      categoriaCriticidad: dto.categoria_criticidad ?? null,
      adjuntoPdfUrl: dto.adjunto_pdf_url ?? null,
      empresaId: dto.empresa_id?.trim() ? dto.empresa_id : null,
    });

    const saved = await this.eppRepository.save(epp);
    return this.applySignedUrls(ResponseEppDto.fromEntity(saved));
  }

  async findAllEpp(
    empresaId?: string,
    empresaIds?: string[],
    includeDeactivated = false,
  ): Promise<ResponseEppDto[]> {
    const qb = this.eppRepository.createQueryBuilder('e').orderBy('e.nombre', 'ASC');
    if (includeDeactivated) {
      qb.withDeleted();
    }
    if (empresaIds && empresaIds.length > 0) {
      qb.andWhere('(e.empresaId IN (:...empresaIds) OR e.empresaId IS NULL)', { empresaIds });
    } else if (empresaId) {
      qb.andWhere('(e.empresaId = :empresaId OR e.empresaId IS NULL)', { empresaId });
    }
    const epps = await qb.getMany();
    const dtos = await Promise.all(
      epps.map((e) => this.applySignedUrls(ResponseEppDto.fromEntity(e))),
    );
    return dtos;
  }

  async findOneEpp(id: string): Promise<ResponseEppDto> {
    const epp = await this.eppRepository.findOne({ where: { id } });

    if (!epp) {
      throw new NotFoundException(`EPP con ID ${id} no encontrado`);
    }

    return this.applySignedUrls(ResponseEppDto.fromEntity(epp));
  }

  async softDeleteEpp(id: string): Promise<void> {
    const epp = await this.eppRepository.findOne({ where: { id }, withDeleted: true });
    if (!epp) {
      throw new NotFoundException(`EPP con ID ${id} no encontrado`);
    }
    if (epp.deletedAt) {
      throw new BadRequestException('Este EPP ya está desactivado');
    }
    await this.eppRepository.softDelete(id);
  }

  async restoreEpp(id: string): Promise<ResponseEppDto> {
    const epp = await this.eppRepository.findOne({ where: { id }, withDeleted: true });
    if (!epp) {
      throw new NotFoundException(`EPP con ID ${id} no encontrado`);
    }
    if (!epp.deletedAt) {
      throw new BadRequestException('Este EPP ya está activo');
    }
    await this.eppRepository.restore(id);
    const restored = await this.eppRepository.findOne({ where: { id } });
    return this.applySignedUrls(ResponseEppDto.fromEntity(restored!));
  }

  async eppTieneEntregas(eppId: string): Promise<boolean> {
    const count = await this.detalleRepository
      .createQueryBuilder('d')
      .innerJoin('d.solicitudEpp', 's')
      .where('d.eppId = :eppId', { eppId })
      .andWhere('d.exceptuado = false')
      .andWhere('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .getCount();
    return count > 0;
  }

  async updateEpp(id: string, dto: UpdateEppDto): Promise<ResponseEppDto> {
    const epp = await this.eppRepository.findOne({ where: { id } });

    if (!epp) {
      throw new NotFoundException(`EPP con ID ${id} no encontrado`);
    }

    // Inmutabilidad condicional: si tiene entregas registradas, no permitir cambiar datos críticos
    const tieneEntregas = await this.detalleRepository
      .createQueryBuilder('d')
      .innerJoin('d.solicitudEpp', 's')
      .where('d.eppId = :eppId', { eppId: id })
      .andWhere('d.exceptuado = false')
      .andWhere('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .getCount()
      .then((n) => n > 0);

    if (tieneEntregas) {
      if (dto.nombre !== undefined && dto.nombre !== epp.nombre) {
        throw new BadRequestException(
          'No puede cambiar el nombre de un EPP que ya tiene registros de entrega. Desactívelo y cree uno nuevo.',
        );
      }
      if (dto.tipo_proteccion !== undefined && dto.tipo_proteccion !== epp.tipoProteccion) {
        throw new BadRequestException(
          'No puede cambiar el tipo de protección de un EPP con entregas registradas. Desactívelo y cree uno nuevo.',
        );
      }
      if (dto.categoria !== undefined && dto.categoria !== epp.categoria) {
        throw new BadRequestException(
          'No puede cambiar la categoría de un EPP con entregas registradas. Desactívelo y cree uno nuevo.',
        );
      }
    }

    if (dto.nombre !== undefined) epp.nombre = dto.nombre;
    if (dto.tipo_proteccion !== undefined) epp.tipoProteccion = dto.tipo_proteccion;
    if (dto.categoria !== undefined) epp.categoria = dto.categoria;
    if (dto.descripcion !== undefined) epp.descripcion = dto.descripcion ?? null;
    if (dto.imagen_url !== undefined) {
      const u = dto.imagen_url;
      epp.imagenUrl = u != null && u.trim() !== '' ? (this.storageService.getCanonicalUrl(u) || u) : null;
    }
    if (dto.vigencia !== undefined) epp.vigencia = dto.vigencia ?? null;
    if (dto.costo !== undefined) epp.costo = dto.costo ?? null;
    if (dto.categoria_criticidad !== undefined) epp.categoriaCriticidad = dto.categoria_criticidad ?? null;
    if (dto.adjunto_pdf_url !== undefined) {
      const u = dto.adjunto_pdf_url;
      epp.adjuntoPdfUrl = u != null && u.trim() !== '' ? (this.storageService.getCanonicalUrl(u) || u) : null;
    }

    const saved = await this.eppRepository.save(epp);
    return this.applySignedUrls(ResponseEppDto.fromEntity(saved));
  }

  async getEppsAnteriormenteSolicitados(trabajadorId: string, empresaId: string): Promise<ResponseEppDto[]> {
    const detalles = await this.detalleRepository
      .createQueryBuilder('det')
      .innerJoin('det.solicitudEpp', 's')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.solicitanteId = :trabajadorId', { trabajadorId })
      .andWhere('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('det.exceptuado = false')
      .getMany();

    const eppIds = [...new Set(detalles.map((d) => d.eppId))];
    if (eppIds.length === 0) return [];

    const epps = await this.eppRepository
      .createQueryBuilder('e')
      .where('e.id IN (:...eppIds)', { eppIds })
      .andWhere('(e.empresaId = :empresaId OR e.empresaId IS NULL)', { empresaId })
      .getMany();

    return Promise.all(epps.map((e) => this.applySignedUrls(ResponseEppDto.fromEntity(e))));
  }

  async getFavoritosEpp(trabajadorId: string): Promise<string[]> {
    const favoritos = await this.favoritoRepository.find({
      where: { trabajadorId },
      select: ['eppId'],
    });
    return favoritos.map((f) => f.eppId);
  }

  async toggleFavoritoEpp(trabajadorId: string, eppId: string): Promise<{ es_favorito: boolean }> {
    const existente = await this.favoritoRepository.findOne({
      where: { trabajadorId, eppId },
    });
    if (existente) {
      await this.favoritoRepository.remove(existente);
      return { es_favorito: false };
    }
    const fav = this.favoritoRepository.create({ trabajadorId, eppId });
    await this.favoritoRepository.save(fav);
    return { es_favorito: true };
  }

  private async applySignedUrls(dto: ResponseEppDto): Promise<ResponseEppDto> {
    if (!this.storageService.isAvailable()) return dto;
    try {
      if (dto.imagen_url?.includes('storage.googleapis.com')) {
        dto.imagen_url = await this.storageService.getSignedUrl(dto.imagen_url, 60);
      }
      if (dto.adjunto_pdf_url?.includes('storage.googleapis.com')) {
        dto.adjunto_pdf_url = await this.storageService.getSignedUrl(dto.adjunto_pdf_url, 60);
      }
    } catch {
      // Mantener URLs originales si falla la firma
    }
    return dto;
  }

  // ========== CRUD Solicitudes ==========

  /**
   * Genera el siguiente código correlativo por empresa de forma segura.
   * Formato: {RUC}-{YEAR}-{NNNN} (ej: 20548123616-2026-0001).
   * Usa transacción + advisory lock para evitar colisiones en concurrencia.
   */
  private async generarSiguienteCodigoCorrelativo(
    empresaId: string,
    manager: { query: (sql: string, params?: any[]) => Promise<any> },
  ): Promise<string> {
    const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
    if (!empresa) {
      throw new NotFoundException(`Empresa ${empresaId} no encontrada`);
    }
    const ruc = (empresa as any).ruc?.replace(/[^0-9]/g, '') || empresaId.substring(0, 8);
    const year = new Date().getFullYear();
    const prefix = `${ruc}-${year}-`;

    // Advisory lock para serializar generación de códigos (evita race conditions)
    await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['epp_correlativo']);

    const result = await manager.query(
      `SELECT codigo_correlativo FROM solicitudes_epp 
       WHERE codigo_correlativo LIKE $1 
       ORDER BY codigo_correlativo DESC 
       LIMIT 1`,
      [`${prefix}%`],
    );

    let nextNum = 1;
    if (result?.length > 0 && result[0]?.codigo_correlativo) {
      const lastCode = result[0].codigo_correlativo;
      const match = lastCode.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`));
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  async create(dto: CreateSolicitudEppDto): Promise<ResponseSolicitudEppDto> {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('Debe incluir al menos un item de EPP');
    }

    const savedId = await this.solicitudRepository.manager.transaction(async (manager) => {
      const solicitudRepo = manager.getRepository(SolicitudEPP);
      const detalleRepo = manager.getRepository(SolicitudEPPDetalle);

      const codigoCorrelativo = await this.generarSiguienteCodigoCorrelativo(dto.empresa_id, manager);

      const solicitud = solicitudRepo.create({
        codigoCorrelativo,
        fechaSolicitud: new Date(),
        usuarioEppId: dto.usuario_epp_id,
        solicitanteId: dto.solicitante_id,
        motivo: dto.motivo ?? null,
        centroCostos: dto.centro_costos ?? null,
        comentarios: dto.comentarios ?? null,
        observaciones: dto.observaciones ?? null,
        estado: dto.estado ?? EstadoSolicitudEPP.Pendiente,
        areaId: dto.area_id ?? null,
        empresaId: dto.empresa_id,
      });

      const saved = await solicitudRepo.save(solicitud);

      const eppRepo = manager.getRepository(EPP);
      const detallesToSave: SolicitudEPPDetalle[] = [];
      for (const detalleDto of dto.detalles) {
        const epp = await eppRepo.findOne({ where: { id: detalleDto.epp_id } });
        const snapshot = snapshotEppToDetalle(epp);
        const detalle = detalleRepo.create({
          solicitudEppId: saved.id,
          eppId: detalleDto.epp_id,
          cantidad: detalleDto.cantidad,
          ...snapshot,
        });
        detallesToSave.push(detalle);
      }
      await detalleRepo.save(detallesToSave);

      return saved.id;
    });

    // Si es auto-solicitud (empleado solicita para sí), adjuntar firma del onboarding
    const solicitudConRelaciones = await this.solicitudRepository.findOne({
      where: { id: savedId },
      relations: ['solicitante', 'usuarioEpp', 'usuarioEpp.trabajador'],
    });
    if (solicitudConRelaciones) {
      const usuarioEpp = solicitudConRelaciones.usuarioEpp as any;
      const solicitante = solicitudConRelaciones.solicitante as any;
      const esAutoSolicitud =
        usuarioEpp?.trabajador?.id === solicitudConRelaciones.solicitanteId;
      if (esAutoSolicitud && solicitante?.firmaDigitalUrl) {
        solicitudConRelaciones.firmaRecepcionUrl = solicitante.firmaDigitalUrl;
        await this.solicitudRepository.save(solicitudConRelaciones);
      }
    }

    const solicitudDto = await this.findOne(savedId);
    const solicitudConRel = await this.solicitudRepository.findOne({
      where: { id: savedId },
      relations: ['solicitante'],
    });
    const solicitanteNombre = (solicitudConRel?.solicitante as any)?.nombreCompleto || 'Un trabajador';
    const codigo = solicitudDto.codigo_correlativo || savedId.slice(0, 8);

    const aprobadores = await this.usuariosService.findUsuariosAprobadoresByEmpresa(dto.empresa_id);
    const payloadAprobadores: PayloadNotificacionCrear = {
      usuarioId: '',
      titulo: 'Nueva solicitud de EPP',
      mensaje: `${solicitanteNombre} ha solicitado equipos de protección. Código: ${codigo}`,
      rutaRedireccion: `/epp/${savedId}`,
      tipo: 'EPP_SOLICITUD',
    };
    for (const u of aprobadores) {
      this.eventEmitter.emit(EVENTO_NOTIFICACION_CREAR, {
        ...payloadAprobadores,
        usuarioId: u.id,
      } as PayloadNotificacionCrear);
    }

    const usuarioSolicitante = await this.usuariosService.findUsuarioByTrabajadorId(dto.solicitante_id);
    if (usuarioSolicitante) {
      this.eventEmitter.emit(EVENTO_NOTIFICACION_CREAR, {
        usuarioId: usuarioSolicitante.id,
        titulo: 'Solicitud de EPP recibida',
        mensaje: `Tu solicitud de EPP (${codigo}) ha sido registrada correctamente.`,
        rutaRedireccion: `/epp`,
        tipo: 'EPP_SOLICITUD_CONFIRMADA',
      } as PayloadNotificacionCrear);
    }

    return solicitudDto;
  }

  async findAll(
    empresaId?: string,
    usuarioEppId?: string,
    solicitanteId?: string,
    estado?: EstadoSolicitudEPP,
    areaId?: string,
    sede?: string,
  ): Promise<ResponseSolicitudEppDto[]> {
    const query = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.usuarioEpp', 'usuarioEpp')
      .leftJoinAndSelect('usuarioEpp.trabajador', 'usuarioEppTrabajador')
      .leftJoinAndSelect('solicitud.solicitante', 'solicitante')
      .leftJoinAndSelect('solicitud.supervisorAprobador', 'supervisorAprobador')
      .leftJoinAndSelect('solicitud.entregadoPor', 'entregadoPor')
      .leftJoinAndSelect('solicitud.area', 'area')
      .leftJoinAndSelect('solicitud.empresa', 'empresa')
      .leftJoinAndSelect('solicitud.detalles', 'detalles')
      .leftJoinAndSelect('detalles.epp', 'epp');

    if (empresaId) {
      query.andWhere('solicitud.empresaId = :empresaId', { empresaId });
    }
    if (usuarioEppId) {
      query.andWhere('solicitud.usuarioEppId = :usuarioEppId', { usuarioEppId });
    }
    if (solicitanteId) {
      query.andWhere('solicitud.solicitanteId = :solicitanteId', { solicitanteId });
    }
    if (estado) {
      query.andWhere('solicitud.estado = :estado', { estado });
    }
    if (areaId) {
      query.andWhere('solicitud.areaId = :areaId', { areaId });
    }

    query.orderBy('solicitud.createdAt', 'DESC');

    const solicitudes = await query.getMany();
    const dtos = solicitudes.map((s) => ResponseSolicitudEppDto.fromEntity(s));
    await Promise.all(dtos.map((d) => this.applySignedUrlsToSolicitudDetalles(d)));
    return dtos;
  }

  async findOne(id: string): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: [
        'usuarioEpp',
        'usuarioEpp.trabajador',
        'solicitante',
        'solicitante.area',
        'supervisorAprobador',
        'supervisorAprobador.trabajador',
        'entregadoPor',
        'entregadoPor.trabajador',
        'area',
        'empresa',
        'detalles',
        'detalles.epp',
        'detalles.exceptuadoPor',
        'detalles.exceptuadoPor.trabajador',
        'detalles.agregadoPor',
        'detalles.agregadoPor.trabajador',
      ],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    const dto = ResponseSolicitudEppDto.fromEntity(solicitud);
    await this.applySignedUrlsToSolicitudDetalles(dto);
    return dto;
  }

  private async applySignedUrlsToSolicitudDetalles(dto: ResponseSolicitudEppDto): Promise<void> {
    if (!this.storageService.isAvailable()) return;
    if (dto.detalles?.length) {
      for (const detalle of dto.detalles) {
        if (detalle.epp_imagen_url?.includes('storage.googleapis.com')) {
          try {
            detalle.epp_imagen_url = await this.storageService.getSignedUrl(detalle.epp_imagen_url, 60);
          } catch {
            // Mantener URL original si falla la firma
          }
        }
      }
    }
    if (dto.solicitante_firma_digital_url?.includes('storage.googleapis.com')) {
      try {
        dto.solicitante_firma_digital_url = await this.storageService.getSignedUrl(
          dto.solicitante_firma_digital_url,
          60,
        );
      } catch {
        // Mantener URL original
      }
    }
  }

  async update(
    id: string,
    dto: UpdateSolicitudEppDto,
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['detalles'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    const estadosInmutables = [
      EstadoSolicitudEPP.Aprobada,
      EstadoSolicitudEPP.Entregada,
      EstadoSolicitudEPP.Rechazada,
    ];
    if (estadosInmutables.includes(solicitud.estado)) {
      throw new BadRequestException(
        `No se puede modificar una solicitud en estado ${solicitud.estado}. Es un estado de auditoría.`,
      );
    }

    if (solicitud.estado === EstadoSolicitudEPP.Pendiente) {
      throw new BadRequestException(
        'No se puede modificar una solicitud en estado PENDIENTE. Cambie a OBSERVADA para realizar ajustes.',
      );
    }

    // Actualizar campos básicos (solo permitido en Observada)
    if (dto.motivo !== undefined) solicitud.motivo = dto.motivo;
    if (dto.centro_costos !== undefined) solicitud.centroCostos = dto.centro_costos;
    if (dto.comentarios !== undefined) solicitud.comentarios = dto.comentarios;
    if (dto.observaciones !== undefined) solicitud.observaciones = dto.observaciones;
    if (dto.area_id !== undefined) solicitud.areaId = dto.area_id;

    // Manejar aprobación
    if (dto.supervisor_aprobador_id !== undefined) {
      solicitud.supervisorAprobadorId = dto.supervisor_aprobador_id;
    }
    if (dto.fecha_aprobacion !== undefined) {
      solicitud.fechaAprobacion = new Date(dto.fecha_aprobacion);
    }
    if (dto.comentarios_aprobacion !== undefined) {
      solicitud.comentariosAprobacion = dto.comentarios_aprobacion;
    }

    // Manejar entrega
    if (dto.entregado_por_id !== undefined) {
      solicitud.entregadoPorId = dto.entregado_por_id;
    }
    if (dto.fecha_entrega !== undefined) {
      solicitud.fechaEntrega = new Date(dto.fecha_entrega);
    }
    if (dto.firma_recepcion_url !== undefined) {
      solicitud.firmaRecepcionUrl = dto.firma_recepcion_url;
    }

    // Manejar cambio de estado
    if (dto.estado !== undefined) {
      solicitud.estado = dto.estado;

      // Auto-completar fechas según el estado
      if (dto.estado === EstadoSolicitudEPP.Aprobada && !solicitud.fechaAprobacion) {
        solicitud.fechaAprobacion = new Date();
      }
      if (dto.estado === EstadoSolicitudEPP.Entregada && !solicitud.fechaEntrega) {
        solicitud.fechaEntrega = new Date();
      }
    }

    await this.solicitudRepository.save(solicitud);
    return this.findOne(id);
  }

  async toggleExceptuar(
    solicitudId: string,
    detalleId: string,
    usuarioId?: string,
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
      relations: ['detalles'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${solicitudId} no encontrada`);
    }

    if (solicitud.estado !== EstadoSolicitudEPP.Observada) {
      throw new BadRequestException(
        'Solo se pueden exceptuar items cuando la solicitud está en estado OBSERVADA',
      );
    }

    const detalle = solicitud.detalles?.find((d) => d.id === detalleId);
    if (!detalle) {
      throw new NotFoundException(`Detalle con ID ${detalleId} no encontrado`);
    }

    detalle.exceptuado = !detalle.exceptuado;
    detalle.exceptuadoPorId = detalle.exceptuado ? usuarioId ?? null : null;
    await this.detalleRepository.save(detalle);

    return this.findOne(solicitudId);
  }

  async agregarDetalle(
    solicitudId: string,
    eppId: string,
    cantidad: number,
    usuarioId?: string,
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
      relations: ['detalles', 'empresa'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${solicitudId} no encontrada`);
    }

    const estadosEditable = [EstadoSolicitudEPP.Observada, EstadoSolicitudEPP.Aprobada];
    if (!estadosEditable.includes(solicitud.estado)) {
      throw new BadRequestException(
        'Solo se pueden agregar items cuando la solicitud está en estado OBSERVADA o APROBADA',
      );
    }

    const epp = await this.eppRepository.findOne({ where: { id: eppId } });
    if (!epp) {
      throw new NotFoundException(`EPP con ID ${eppId} no encontrado`);
    }

    // EPP con empresaId null es global (disponible para todas las empresas)
    if (epp.empresaId != null && epp.empresaId !== solicitud.empresaId) {
      throw new BadRequestException('El EPP debe pertenecer a la misma empresa que la solicitud');
    }

    const snapshot = snapshotEppToDetalle(epp);
    const detalle = this.detalleRepository.create({
      solicitudEppId: solicitudId,
      eppId,
      cantidad: Math.max(1, cantidad),
      agregado: true,
      agregadoPorId: usuarioId ?? null,
      ...snapshot,
    });

    await this.detalleRepository.save(detalle);

    return this.findOne(solicitudId);
  }

  private readonly TRANSICIONES_VALIDAS: Record<EstadoSolicitudEPP, EstadoSolicitudEPP[]> = {
    [EstadoSolicitudEPP.Pendiente]: [EstadoSolicitudEPP.Observada, EstadoSolicitudEPP.Aprobada, EstadoSolicitudEPP.Rechazada],
    [EstadoSolicitudEPP.Observada]: [EstadoSolicitudEPP.Pendiente, EstadoSolicitudEPP.Aprobada, EstadoSolicitudEPP.Rechazada],
    [EstadoSolicitudEPP.Aprobada]: [EstadoSolicitudEPP.Entregada],
    [EstadoSolicitudEPP.Entregada]: [],
    [EstadoSolicitudEPP.Rechazada]: [],
  };

  async updateEstado(
    id: string,
    nuevoEstado: EstadoSolicitudEPP,
    usuarioId?: string,
    opts?: {
      comentariosAprobacion?: string;
      observaciones?: string;
      firmaRecepcionUrl?: string;
      firmaRecepcionBase64?: string;
      password?: string;
    },
  ): Promise<ResponseSolicitudEppDto> {
    const solicitud = await this.solicitudRepository.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    const permitidos = this.TRANSICIONES_VALIDAS[solicitud.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede pasar de ${solicitud.estado} a ${nuevoEstado}. Transiciones permitidas: ${permitidos.join(', ') || 'ninguna'}`,
      );
    }

    // Entregada: validar contraseña del usuario que registra (admin/sst)
    if (nuevoEstado === EstadoSolicitudEPP.Entregada && usuarioId) {
      if (!opts?.password) {
        throw new UnauthorizedException('Debe ingresar su contraseña para registrar la entrega');
      }
      const passwordValid = await this.usuariosService.verifyPassword(usuarioId, opts.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Contraseña incorrecta');
      }
    }

    // Entregada: firma del solicitante (recepción) - base64 o URL
    let firmaRecepcionUrl = opts?.firmaRecepcionUrl;
    if (nuevoEstado === EstadoSolicitudEPP.Entregada && opts?.firmaRecepcionBase64) {
      validateSignatureOrThrow(opts.firmaRecepcionBase64, 'firma de recepción');
      const base64Data = opts.firmaRecepcionBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const empresa = await this.empresaRepository.findOne({ where: { id: solicitud.empresaId } });
      const rucEmpresa = (empresa as any)?.ruc ?? 'sistema';
      if (this.storageService.isAvailable()) {
        try {
          firmaRecepcionUrl = await this.storageService.uploadFile(
            rucEmpresa,
            buffer,
            'firma_recepcion',
            { filename: `firma-recepcion-${solicitud.id}.png` },
          );
        } catch (err: any) {
          if (err?.response?.status === 403 || err?.message?.includes('billing')) {
            firmaRecepcionUrl = opts.firmaRecepcionBase64;
          } else {
            throw new BadRequestException(
              `Error al subir firma: ${err?.response?.data?.error?.message || err?.message || 'Error de almacenamiento'}`,
            );
          }
        }
      } else {
        firmaRecepcionUrl = opts.firmaRecepcionBase64;
      }
    }

    solicitud.estado = nuevoEstado;

    if (nuevoEstado === EstadoSolicitudEPP.Observada && opts?.observaciones !== undefined) {
      solicitud.observaciones = opts.observaciones || null;
    }

    if (nuevoEstado === EstadoSolicitudEPP.Aprobada) {
      if (usuarioId) {
        solicitud.supervisorAprobadorId = usuarioId;
      }
      if (!solicitud.fechaAprobacion) {
        solicitud.fechaAprobacion = new Date();
      }
      if (opts?.comentariosAprobacion) {
        solicitud.comentariosAprobacion = opts.comentariosAprobacion;
      }
    }

    if (nuevoEstado === EstadoSolicitudEPP.Entregada) {
      if (usuarioId) {
        solicitud.entregadoPorId = usuarioId;
      }
      const fechaEntrega = new Date();
      if (!solicitud.fechaEntrega) {
        solicitud.fechaEntrega = fechaEntrega;
      }
      if (firmaRecepcionUrl) {
        solicitud.firmaRecepcionUrl = firmaRecepcionUrl;
      } else if (opts?.firmaRecepcionBase64 && !this.storageService.isAvailable()) {
        solicitud.firmaRecepcionUrl = opts.firmaRecepcionBase64;
      } else if (!firmaRecepcionUrl && !opts?.firmaRecepcionBase64) {
        // Usar firma del solicitante (perfil) cuando no se proporciona firma en la entrega
        const solConSolicitante = await this.solicitudRepository.findOne({
          where: { id },
          relations: ['solicitante'],
        });
        const firmaSolicitante = (solConSolicitante?.solicitante as any)?.firmaDigitalUrl;
        if (!firmaSolicitante || !firmaSolicitante.trim()) {
          throw new BadRequestException(
            'El solicitante no tiene una firma registrada. El trabajador debe ingresar su firma en el momento de la entrega.',
          );
        }
        solicitud.firmaRecepcionUrl = firmaSolicitante;
      }

      const solicitudConDetalles = await this.solicitudRepository.findOne({
        where: { id },
        relations: [
          'detalles',
          'detalles.epp',
          'solicitante',
          'solicitante.area',
          'solicitante.empresa',
          'empresa',
          'entregadoPor',
          'entregadoPor.trabajador',
          'area',
        ],
      });

      if (solicitudConDetalles?.detalles) {
        for (const det of solicitudConDetalles.detalles) {
          if (!det.exceptuado) {
            det.codigoAuditoria = det.id.substring(0, 8);
            det.fechaHoraEntrega = solicitud.fechaEntrega || fechaEntrega;
            // Priorizar firma de transacción (capturada en entrega) sobre firma maestra (onboarding)
            det.firmaTrabajadorUrl = solicitud.firmaRecepcionUrl ?? (solicitudConDetalles.solicitante as any)?.firmaDigitalUrl ?? null;
            // Backfill snapshot si no existe (registros antiguos)
            if (!det.eppNombreHistorico && det.epp) {
              const snap = snapshotEppToDetalle(det.epp as EPP);
              det.eppNombreHistorico = snap.eppNombreHistorico;
              det.eppTipoProteccionHistorico = snap.eppTipoProteccionHistorico;
              det.eppCategoriaHistorica = snap.eppCategoriaHistorica;
              det.eppDescripcionHistorica = snap.eppDescripcionHistorica;
              det.eppVigenciaHistorica = snap.eppVigenciaHistorica;
              det.eppImagenUrlHistorica = snap.eppImagenUrlHistorica;
            }
            await this.detalleRepository.save(det);
          }
        }

        try {
          const empresaReg = solicitudConDetalles.empresa as any;
          let logoUrlReg: string | undefined;
          if (empresaReg?.logoUrl && this.storageService.isAvailable()) {
            try {
              logoUrlReg = await this.storageService.getSignedUrl(empresaReg.logoUrl, 5);
            } catch {
              logoUrlReg = empresaReg.logoUrl;
            }
          }
          const { buffer } = await this.eppPdfService.generateRegistroEntregaPdf(
            solicitudConDetalles,
            logoUrlReg ?? empresaReg?.logoUrl,
          );
          const empresa = solicitudConDetalles.empresa as any;
          const rucEmpresa = empresa?.ruc ?? 'sistema';
          if (this.storageService.isAvailable()) {
            try {
              solicitud.registroEntregaPdfUrl = await this.storageService.uploadFile(
                rucEmpresa,
                buffer,
                'pdf_entrega',
                { filename: `registro-${solicitud.id}.pdf` },
              );
            } catch (err: any) {
              if (err?.response?.status === 403 || err?.message?.includes('billing')) {
                this.eppPdfService.saveBufferToDisk(solicitud.id, buffer);
                solicitud.registroEntregaPdfUrl = `/epp/registro-pdf/${solicitud.id}`;
              } else {
                throw err;
              }
            }
          } else {
            this.eppPdfService.saveBufferToDisk(solicitud.id, buffer);
            solicitud.registroEntregaPdfUrl = `/epp/registro-pdf/${solicitud.id}`;
          }
        } catch (err) {
          console.error('Error generando PDF de registro:', err);
        }

        // Generar kardex consolidado (todos los items de todas las entregas del trabajador)
        const trabajadorId = solicitudConDetalles.solicitanteId;
        const todasEntregas = await this.solicitudRepository.find({
          where: { solicitanteId: trabajadorId, estado: EstadoSolicitudEPP.Entregada },
          relations: [
            'detalles',
            'detalles.epp',
            'solicitante',
            'solicitante.area',
            'solicitante.empresa',
            'empresa',
            'entregadoPor',
            'entregadoPor.trabajador',
          ],
          order: { fechaEntrega: 'DESC' },
        });
        // La solicitud actual aún no está guardada con estado Entregada; incluirla explícitamente
        const solicitudActual = Object.assign(solicitudConDetalles, {
          estado: EstadoSolicitudEPP.Entregada,
          fechaEntrega: solicitud.fechaEntrega || fechaEntrega,
          firmaRecepcionUrl: solicitud.firmaRecepcionUrl,
          entregadoPorId: solicitud.entregadoPorId,
        });
        // Cargar entregadoPor (Usuario con firmaUrl) para la solicitud actual; la BD aún no tiene el nuevo entregadoPorId
        if (solicitud.entregadoPorId) {
          const usuarioEntregador = await this.usuariosService.findById(solicitud.entregadoPorId);
          if (usuarioEntregador) {
            (solicitudActual as any).entregadoPor = usuarioEntregador;
          }
        }
        const entregasParaKardex = [...todasEntregas.filter((s) => s.id !== solicitudConDetalles.id), solicitudActual];
        entregasParaKardex.sort((a, b) => {
          const dA = a.fechaEntrega ? new Date(a.fechaEntrega).getTime() : 0;
          const dB = b.fechaEntrega ? new Date(b.fechaEntrega).getTime() : 0;
          return dB - dA;
        });
        try {
          const trabajador = solicitudConDetalles.solicitante;
          const empresaKardex = (trabajador as any)?.empresa ?? (solicitudConDetalles.empresa as any);
          let logoUrlSigned: string | undefined;
          if (empresaKardex?.logoUrl && this.storageService.isAvailable()) {
            try {
              logoUrlSigned = await this.storageService.getSignedUrl(empresaKardex.logoUrl, 5);
            } catch {
              // Usar URL original si falla la firma
            }
          }
          const kardexBuffer = await this.eppPdfService.generateKardexPdfPorTrabajador(
            trabajador,
            entregasParaKardex,
            logoUrlSigned ?? empresaKardex?.logoUrl,
          );
          const rucEmpresa = (solicitudConDetalles.empresa as any)?.ruc ?? 'sistema';
          const trabajadorEntity = await this.trabajadorRepository.findOne({
            where: { id: trabajadorId },
          });
          if (trabajadorEntity) {
            let kardexUrl: string | null = null;
            if (this.storageService.isAvailable()) {
              try {
                const timestamp = Date.now();
                kardexUrl = await this.storageService.uploadFile(
                  rucEmpresa,
                  kardexBuffer,
                  'kardex_pdf',
                  { filename: `kardex-${trabajadorId}-${solicitud.id}-${timestamp}.pdf` },
                );
                trabajadorEntity.kardexPdfUrl = kardexUrl;
                solicitud.kardexPdfUrl = kardexUrl;
              } catch (err: any) {
                if (err?.response?.status === 403 || err?.message?.includes('billing')) {
                  this.eppPdfService.saveKardexToDisk(trabajadorId, kardexBuffer);
                  trabajadorEntity.kardexPdfUrl = `/epp/kardex-pdf/${trabajadorId}`;
                }
              }
            } else {
              this.eppPdfService.saveKardexToDisk(trabajadorId, kardexBuffer);
              trabajadorEntity.kardexPdfUrl = `/epp/kardex-pdf/${trabajadorId}`;
            }
            await this.trabajadorRepository.save(trabajadorEntity);
          }
        } catch (err) {
          console.error('Error generando kardex PDF:', err);
        }
      }
    }

    if (nuevoEstado === EstadoSolicitudEPP.Rechazada) {
      if (usuarioId) {
        solicitud.supervisorAprobadorId = usuarioId;
      }
      if (opts?.comentariosAprobacion) {
        solicitud.comentariosAprobacion = opts.comentariosAprobacion;
      }
    }

    await this.solicitudRepository.save(solicitud);

    if (nuevoEstado === EstadoSolicitudEPP.Aprobada || nuevoEstado === EstadoSolicitudEPP.Entregada) {
      const usuarioSolicitante = await this.usuariosService.findUsuarioByTrabajadorId(solicitud.solicitanteId);
      if (usuarioSolicitante) {
        const codigo = solicitud.codigoCorrelativo || solicitud.id.slice(0, 8);
        const titulo =
          nuevoEstado === EstadoSolicitudEPP.Aprobada
            ? 'Solicitud de EPP aprobada'
            : 'Solicitud de EPP entregada';
        const mensaje =
          nuevoEstado === EstadoSolicitudEPP.Aprobada
            ? `Tu solicitud de EPP (${codigo}) ha sido aprobada. Puedes acercarte a almacén para la entrega.`
            : `Tu solicitud de EPP (${codigo}) ha sido entregada correctamente.`;
        this.eventEmitter.emit(EVENTO_NOTIFICACION_CREAR, {
          usuarioId: usuarioSolicitante.id,
          titulo,
          mensaje,
          rutaRedireccion: `/epp`,
          tipo: nuevoEstado === EstadoSolicitudEPP.Aprobada ? 'EPP_APROBADO' : 'EPP_ENTREGADO',
        } as PayloadNotificacionCrear);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const solicitud = await this.solicitudRepository.findOne({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud EPP con ID ${id} no encontrada`);
    }

    if (solicitud.estado === EstadoSolicitudEPP.Entregada) {
      throw new BadRequestException(
        'No se puede eliminar una solicitud que ya fue entregada',
      );
    }

    await this.solicitudRepository.remove(solicitud);
  }

  // ========== Kardex Histórico ==========

  async getKardexPorTrabajador(
    trabajadorId: string,
  ): Promise<ResponseKardexDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: trabajadorId },
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${trabajadorId} no encontrado`);
    }

    const solicitudes = await this.solicitudRepository.find({
      where: { solicitanteId: trabajadorId, estado: EstadoSolicitudEPP.Entregada },
      relations: [
        'usuarioEpp',
        'solicitante',
        'supervisorAprobador',
        'entregadoPor',
        'area',
        'empresa',
        'detalles',
        'detalles.epp',
      ],
      order: { fechaEntrega: 'DESC' },
    });

    return ResponseKardexDto.fromEntity({
      trabajador,
      solicitudes,
    });
  }

  async getKardexList(
    empresaIds?: string[],
    filters?: {
      nombre?: string;
      estado?: EstadoVigenciaKardex;
      categoria?: string;
      unidad?: string;
      sede?: string;
      gerencia?: string;
      area_id?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
    },
  ): Promise<ResponseKardexListItemDto[]> {
    const qb = this.solicitudRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.solicitante', 't')
      .leftJoinAndSelect('t.area', 'area')
      .leftJoinAndSelect('t.empresa', 'empresa')
      .leftJoinAndSelect('s.detalles', 'det')
      .leftJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL');

    if (empresaIds && empresaIds.length > 0) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }
    if (filters?.fecha_desde) {
      qb.andWhere('s.fecha_entrega >= :fechaDesde', {
        fechaDesde: filters.fecha_desde,
      });
    }
    if (filters?.fecha_hasta) {
      qb.andWhere('s.fecha_entrega <= :fechaHasta', {
        fechaHasta: filters.fecha_hasta,
      });
    }
    if (filters?.unidad) {
      qb.andWhere('t.unidad = :unidad', { unidad: filters.unidad });
    }
    if (filters?.sede) {
      qb.andWhere('t.sede = :sede', { sede: filters.sede });
    }
    if (filters?.gerencia) {
      qb.andWhere('t.gerencia = :gerencia', { gerencia: filters.gerencia });
    }
    if (filters?.area_id) {
      qb.andWhere('t.area_id = :areaId', { areaId: filters.area_id });
    }
    if (filters?.nombre) {
      qb.andWhere('LOWER(t.nombre_completo) LIKE LOWER(:nombre)', {
        nombre: `%${filters.nombre}%`,
      });
    }

    qb.orderBy('s.fecha_entrega', 'DESC');

    const solicitudes = await qb.getMany();

    const byTrabajador = new Map<string, SolicitudEPP>();
    for (const s of solicitudes) {
      const tid = s.solicitanteId;
      if (!byTrabajador.has(tid)) {
        byTrabajador.set(tid, s);
      }
    }

    const now = new Date();
    const result: ResponseKardexListItemDto[] = [];

    for (const [, solicitud] of byTrabajador) {
      const t = solicitud.solicitante as any;
      const emp = t?.empresa;
      const area = t?.area;

      let estado = EstadoVigenciaKardex.SinRegistro;
      let coreVencido = false;
      let recurrenteVencido = false;
      let categoriaPrimera: string | null = null;

      for (const det of solicitud.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        if (!epp) continue;

        const vigenciaMeses = vigenciaToMonths(epp.vigencia);
        const fechaEntrega = solicitud.fechaEntrega
          ? new Date(solicitud.fechaEntrega)
          : null;
        if (!fechaEntrega || vigenciaMeses === 0) continue;

        const vencimiento = new Date(fechaEntrega);
        vencimiento.setMonth(vencimiento.getMonth() + vigenciaMeses);
        const vencido = now > vencimiento;

        const criticidad = epp.categoriaCriticidad;
        if (!categoriaPrimera) categoriaPrimera = epp.categoria;

        if (criticidad === CategoriaCriticidadEPP.Core) {
          if (vencido) coreVencido = true;
        } else if (criticidad === CategoriaCriticidadEPP.Recurrente) {
          if (vencido) recurrenteVencido = true;
        } else {
          if (vencido) recurrenteVencido = true;
        }
      }

      if (coreVencido) {
        estado = EstadoVigenciaKardex.Vencido;
      } else if (recurrenteVencido) {
        estado = EstadoVigenciaKardex.VencimientoMenor;
      } else if (solicitud.detalles?.some((d) => !d.exceptuado)) {
        estado = EstadoVigenciaKardex.Vigente;
      }

      if (filters?.estado && estado !== filters.estado) continue;
      if (filters?.categoria && categoriaPrimera !== filters.categoria) continue;

      result.push({
        trabajador_id: t?.id ?? solicitud.solicitanteId,
        trabajador_nombre: t?.nombreCompleto ?? 'Sin nombre',
        trabajador_documento: t?.documentoIdentidad ?? null,
        razon_social: emp?.nombre ?? null,
        unidad: t?.unidad ?? null,
        sede: t?.sede ?? null,
        gerencia: t?.gerencia ?? null,
        area: area?.nombre ?? null,
        fecha_entrega: solicitud.fechaEntrega
          ? new Date(solicitud.fechaEntrega).toISOString()
          : null,
        estado,
        categoria_filtro: categoriaPrimera,
      });
    }

    result.sort((a, b) => {
      const dA = a.fecha_entrega ? new Date(a.fecha_entrega).getTime() : 0;
      const dB = b.fecha_entrega ? new Date(b.fecha_entrega).getTime() : 0;
      return dB - dA;
    });

    return result;
  }

  async getUltimoKardexPdfUrl(
    trabajadorId: string,
  ): Promise<{ pdf_url: string | null; trabajador_id: string | null }> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: trabajadorId },
    });
    if (!trabajador) {
      return { pdf_url: null, trabajador_id: null };
    }
    const tieneEntregas = await this.solicitudRepository.exists({
      where: { solicitanteId: trabajadorId, estado: EstadoSolicitudEPP.Entregada },
    });
    if (!tieneEntregas) {
      return { pdf_url: null, trabajador_id: null };
    }
    return { pdf_url: trabajador.kardexPdfUrl ?? null, trabajador_id: trabajadorId };
  }

  /** Obtiene el buffer del PDF de kardex consolidado del trabajador. */
  async getKardexPdfBuffer(trabajadorId: string): Promise<Buffer> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: trabajadorId },
      relations: ['empresa'],
    });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador ${trabajadorId} no encontrado`);
    }
    if (!trabajador.kardexPdfUrl) {
      const todasEntregas = await this.solicitudRepository.find({
        where: { solicitanteId: trabajadorId, estado: EstadoSolicitudEPP.Entregada },
        relations: [
          'detalles',
          'detalles.epp',
          'solicitante',
          'solicitante.area',
          'solicitante.empresa',
          'empresa',
          'entregadoPor',
          'entregadoPor.trabajador',
        ],
        order: { fechaEntrega: 'DESC' },
      });
      const detallesCount = todasEntregas.reduce((s, sol) => s + (sol.detalles?.filter((d) => !d.exceptuado).length ?? 0), 0);
      if (detallesCount === 0) {
        throw new NotFoundException(
          'No hay entregas registradas para este trabajador. El kardex se genera al marcar una solicitud como entregada.',
        );
      }
      const empresaKardex = (trabajador as any)?.empresa ?? (todasEntregas[0]?.empresa as any);
      let logoUrlSigned: string | undefined;
      if (empresaKardex?.logoUrl && this.storageService.isAvailable()) {
        try {
          logoUrlSigned = await this.storageService.getSignedUrl(empresaKardex.logoUrl, 5);
        } catch {
          // Usar URL original si falla la firma
        }
      }
      const kardexBuffer = await this.eppPdfService.generateKardexPdfPorTrabajador(
        trabajador,
        todasEntregas,
        logoUrlSigned ?? empresaKardex?.logoUrl,
      );
      const empresa = todasEntregas[0]?.empresa as any;
      const rucEmpresa = empresa?.ruc ?? 'sistema';
      if (this.storageService.isAvailable()) {
        const timestamp = Date.now();
        trabajador.kardexPdfUrl = await this.storageService.uploadFile(
          rucEmpresa,
          kardexBuffer,
          'kardex_pdf',
          { filename: `kardex-${trabajadorId}-${timestamp}.pdf` },
        );
      } else {
        this.eppPdfService.saveKardexToDisk(trabajadorId, kardexBuffer);
        trabajador.kardexPdfUrl = `/epp/kardex-pdf/${trabajadorId}`;
      }
      await this.trabajadorRepository.save(trabajador);
      return kardexBuffer;
    }
    const url = trabajador.kardexPdfUrl;
    if (url.includes('storage.googleapis.com') && this.storageService.isAvailable()) {
      return this.storageService.downloadFile(url);
    }
    const filepath = this.eppPdfService.getKardexPdfPath(trabajadorId);
    if (!filepath) {
      throw new NotFoundException('PDF de kardex no encontrado');
    }
    const fs = await import('fs');
    return fs.promises.readFile(filepath);
  }

  /** Obtiene el buffer del PDF de registro para descarga (desde GCS o disco). */
  async getRegistroPdfBuffer(solicitudId: string): Promise<Buffer> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
    });
    if (!solicitud?.registroEntregaPdfUrl) {
      throw new NotFoundException(`PDF de registro no encontrado para la solicitud ${solicitudId}`);
    }
    const url = solicitud.registroEntregaPdfUrl;
    if (url.includes('storage.googleapis.com') && this.storageService.isAvailable()) {
      return this.storageService.downloadFile(url);
    }
    const filepath = this.eppPdfService.getPdfPath(solicitudId);
    if (!filepath) {
      throw new NotFoundException(`PDF de registro no encontrado`);
    }
    const fs = await import('fs');
    return fs.promises.readFile(filepath);
  }

  /** Obtiene el buffer del PDF de kardex asociado a una solicitud entregada. */
  async getKardexPdfBufferBySolicitud(solicitudId: string): Promise<Buffer> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
    });
    if (!solicitud?.kardexPdfUrl) {
      throw new NotFoundException(
        `PDF de kardex no encontrado para la solicitud ${solicitudId}`,
      );
    }
    const url = solicitud.kardexPdfUrl;
    if (url.includes('storage.googleapis.com') && this.storageService.isAvailable()) {
      return this.storageService.downloadFile(url);
    }
    throw new NotFoundException(`PDF de kardex no disponible para la solicitud ${solicitudId}`);
  }

  // ========== Reportes EPP ==========

  private clasificarVigencia(
    fechaEntrega: Date,
    vigenciaMeses: number,
  ): 'vencido' | 'vigente' | 'por_vencer' {
    if (vigenciaMeses <= 0) return 'vencido';
    const vencimiento = new Date(fechaEntrega);
    vencimiento.setMonth(vencimiento.getMonth() + vigenciaMeses);
    const now = new Date();
    if (now > vencimiento) return 'vencido';
    const diasRestantes = (vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diasRestantes <= 30 ? 'por_vencer' : 'vigente';
  }

  async getReporteEstadosEpp(empresaIds?: string[]): Promise<ReporteEstadosEppDto> {
    const qb = this.solicitudRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.detalles', 'det')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL')
      .andWhere('det.exceptuado = false');

    if (empresaIds?.length) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }

    const solicitudes = await qb.getMany();
    let vencido = 0;
    let vigente = 0;
    let porVencer = 0;

    for (const s of solicitudes) {
      const fechaEntrega = s.fechaEntrega ? new Date(s.fechaEntrega) : null;
      if (!fechaEntrega) continue;
      for (const det of s.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        const vigenciaMeses = vigenciaToMonths(epp?.vigencia);
        const estado = this.clasificarVigencia(fechaEntrega, vigenciaMeses);
        const qty = det.cantidad || 1;
        if (estado === 'vencido') vencido += qty;
        else if (estado === 'vigente') vigente += qty;
        else porVencer += qty;
      }
    }

    const total = vencido + vigente + porVencer;
    return { vencido, vigente, por_vencer: porVencer, total };
  }

  async getReporteEntregasPorEmpresa(
    empresaIds?: string[],
  ): Promise<ReporteEntregasPorEmpresaDto[]> {
    const qb = this.solicitudRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.empresa', 'empresa')
      .innerJoinAndSelect('s.detalles', 'det')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL')
      .andWhere('det.exceptuado = false');

    if (empresaIds?.length) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }

    const solicitudes = await qb.getMany();
    const byEmpresa = new Map<
      string,
      { nombre: string; vencido: number; vigente: number; porVencer: number }
    >();

    for (const s of solicitudes) {
      const emp = s.empresa as any;
      const empId = s.empresaId;
      const empNombre = emp?.nombre ?? 'Sin empresa';
      if (!byEmpresa.has(empId)) {
        byEmpresa.set(empId, {
          nombre: empNombre,
          vencido: 0,
          vigente: 0,
          porVencer: 0,
        });
      }
      const fechaEntrega = s.fechaEntrega ? new Date(s.fechaEntrega) : null;
      if (!fechaEntrega) continue;
      for (const det of s.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        const vigenciaMeses = vigenciaToMonths(epp?.vigencia);
        const estado = this.clasificarVigencia(fechaEntrega, vigenciaMeses);
        const qty = det.cantidad || 1;
        const rec = byEmpresa.get(empId)!;
        if (estado === 'vencido') rec.vencido += qty;
        else if (estado === 'vigente') rec.vigente += qty;
        else rec.porVencer += qty;
      }
    }

    return Array.from(byEmpresa.entries()).map(([empresa_id, rec]) => ({
      empresa_id,
      empresa_nombre: rec.nombre,
      total: rec.vencido + rec.vigente + rec.porVencer,
      vencido: rec.vencido,
      vigente: rec.vigente,
      por_vencer: rec.porVencer,
    }));
  }

  async getReporteEntregasPorEmpresaArea(
    empresaIds?: string[],
  ): Promise<ReporteEntregasPorEmpresaAreaDto[]> {
    const qb = this.solicitudRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.empresa', 'empresa')
      .innerJoinAndSelect('s.solicitante', 't')
      .leftJoinAndSelect('t.area', 'area')
      .innerJoinAndSelect('s.detalles', 'det')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL')
      .andWhere('det.exceptuado = false');

    if (empresaIds?.length) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }

    const solicitudes = await qb.getMany();
    const byKey = new Map<
      string,
      { empNombre: string; areaNombre: string; vencido: number; vigente: number; porVencer: number }
    >();

    for (const s of solicitudes) {
      const emp = s.empresa as any;
      const t = s.solicitante as any;
      const area = t?.area;
      const empId = s.empresaId;
      const areaId = t?.areaId ?? null;
      const empNombre = emp?.nombre ?? 'Sin empresa';
      const areaNombre = area?.nombre ?? 'Sin área';
      const key = `${empId}|${areaId ?? 'null'}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          empNombre,
          areaNombre,
          vencido: 0,
          vigente: 0,
          porVencer: 0,
        });
      }
      const fechaEntrega = s.fechaEntrega ? new Date(s.fechaEntrega) : null;
      if (!fechaEntrega) continue;
      for (const det of s.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        const vigenciaMeses = vigenciaToMonths(epp?.vigencia);
        const estado = this.clasificarVigencia(fechaEntrega, vigenciaMeses);
        const qty = det.cantidad || 1;
        const rec = byKey.get(key)!;
        if (estado === 'vencido') rec.vencido += qty;
        else if (estado === 'vigente') rec.vigente += qty;
        else rec.porVencer += qty;
      }
    }

    return Array.from(byKey.entries()).map(([k, rec]) => {
      const [empresa_id, area_id] = k.split('|');
      return {
        empresa_id,
        empresa_nombre: rec.empNombre,
        area_id: area_id === 'null' ? null : area_id,
        area_nombre: rec.areaNombre,
        total: rec.vencido + rec.vigente + rec.porVencer,
        vencido: rec.vencido,
        vigente: rec.vigente,
        por_vencer: rec.porVencer,
      };
    });
  }

  async getReporteEntregasPorMes(
    empresaIds?: string[],
    fechaDesde?: string,
    fechaHasta?: string,
  ): Promise<ReporteEntregasPorMesDto[]> {
    const qb = this.solicitudRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.solicitante', 't')
      .leftJoinAndSelect('t.empresa', 'empresa')
      .innerJoinAndSelect('s.detalles', 'det')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL')
      .andWhere('det.exceptuado = false');

    if (empresaIds?.length) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }
    if (fechaDesde) {
      qb.andWhere('s.fecha_entrega >= :fechaDesde', { fechaDesde });
    }
    if (fechaHasta) {
      qb.andWhere('s.fecha_entrega <= :fechaHasta', { fechaHasta });
    }
    qb.orderBy('s.fecha_entrega', 'DESC');

    const solicitudes = await qb.getMany();
    const result: ReporteEntregasPorMesDto[] = [];

    for (const s of solicitudes) {
      const t = s.solicitante as any;
      const emp = t?.empresa;
      const fechaEntrega = s.fechaEntrega ? new Date(s.fechaEntrega) : null;
      if (!fechaEntrega) continue;
      for (const det of s.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        const vigenciaMeses = vigenciaToMonths(epp?.vigencia);
        const vencimiento = new Date(fechaEntrega);
        vencimiento.setMonth(vencimiento.getMonth() + vigenciaMeses);
        const estado = this.clasificarVigencia(fechaEntrega, vigenciaMeses);
        const vigenciaLabel =
          estado === 'vencido' ? 'Vencido' : estado === 'vigente' ? 'Vigente' : 'Por vencer';
        result.push({
          fecha_entrega: fechaEntrega.toISOString(),
          trabajador_id: t?.id ?? s.solicitanteId,
          trabajador_nombre: t?.nombreCompleto ?? 'Sin nombre',
          nro_documento: t?.documentoIdentidad ?? t?.numeroDocumento ?? '-',
          fecha_vencimiento: vigenciaMeses > 0 ? vencimiento.toISOString() : null,
          razon_social: emp?.nombre ?? 'Sin empresa',
          sede: t?.sede ?? null,
          equipo: epp?.nombre ?? 'Sin nombre',
          vigencia: vigenciaLabel,
          cantidad: det.cantidad || 1,
          costo_unitario: epp?.costo ? Number(epp.costo) : null,
        });
      }
    }

    return result;
  }

  async getReporteEntregasPorSede(
    empresaIds?: string[],
  ): Promise<ReporteEntregasPorSedeDto[]> {
    const qb = this.solicitudRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.solicitante', 't')
      .innerJoinAndSelect('s.detalles', 'det')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL')
      .andWhere('det.exceptuado = false');

    if (empresaIds?.length) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }

    const solicitudes = await qb.getMany();
    const bySede = new Map<
      string,
      { vencido: number; vigente: number; porVencer: number }
    >();

    for (const s of solicitudes) {
      const t = s.solicitante as any;
      const sede = t?.sede ?? 'Sin sede';
      if (!bySede.has(sede)) {
        bySede.set(sede, { vencido: 0, vigente: 0, porVencer: 0 });
      }
      const fechaEntrega = s.fechaEntrega ? new Date(s.fechaEntrega) : null;
      if (!fechaEntrega) continue;
      for (const det of s.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        const vigenciaMeses = vigenciaToMonths(epp?.vigencia);
        const estado = this.clasificarVigencia(fechaEntrega, vigenciaMeses);
        const qty = det.cantidad || 1;
        const rec = bySede.get(sede)!;
        if (estado === 'vencido') rec.vencido += qty;
        else if (estado === 'vigente') rec.vigente += qty;
        else rec.porVencer += qty;
      }
    }

    return Array.from(bySede.entries()).map(([sede, rec]) => ({
      sede,
      total: rec.vencido + rec.vigente + rec.porVencer,
      vencido: rec.vencido,
      vigente: rec.vigente,
      por_vencer: rec.porVencer,
    }));
  }

  async getReporteEppsMasSolicitados(
    empresaIds?: string[],
  ): Promise<ReporteEppsMasSolicitadosDto[]> {
    const qb = this.detalleRepository
      .createQueryBuilder('det')
      .innerJoin('det.solicitudEpp', 's')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL')
      .andWhere('det.exceptuado = false');

    if (empresaIds?.length) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }

    const detalles = await qb.getMany();
    const byEpp = new Map<string, { nombre: string; total: number }>();

    for (const det of detalles) {
      const epp = det.epp as any;
      const eppId = det.eppId;
      const nombre = epp?.nombre ?? 'Sin nombre';
      const qty = det.cantidad || 1;
      if (!byEpp.has(eppId)) {
        byEpp.set(eppId, { nombre, total: 0 });
      }
      byEpp.get(eppId)!.total += qty;
    }

    return Array.from(byEpp.entries())
      .map(([epp_id, rec]) => ({
        epp_id,
        epp_nombre: rec.nombre,
        total_solicitado: rec.total,
        cantidad_entregas: rec.total,
      }))
      .sort((a, b) => b.total_solicitado - a.total_solicitado);
  }

  async getReporteTrabajadorCostoHistorico(
    empresaIds?: string[],
  ): Promise<ReporteTrabajadorCostoDto[]> {
    const qb = this.solicitudRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.solicitante', 't')
      .leftJoinAndSelect('t.empresa', 'empresa')
      .innerJoinAndSelect('s.detalles', 'det')
      .innerJoinAndSelect('det.epp', 'epp')
      .where('s.estado = :estado', { estado: EstadoSolicitudEPP.Entregada })
      .andWhere('s.fecha_entrega IS NOT NULL')
      .andWhere('det.exceptuado = false');

    if (empresaIds?.length) {
      qb.andWhere('s.empresa_id IN (:...empresaIds)', { empresaIds });
    }

    const solicitudes = await qb.getMany();
    const byTrabajador = new Map<
      string,
      { nombre: string; doc: string; razon: string; items: number; costo: number }
    >();

    for (const s of solicitudes) {
      const t = s.solicitante as any;
      const emp = t?.empresa;
      const tid = t?.id ?? s.solicitanteId;
      const nombre = t?.nombreCompleto ?? 'Sin nombre';
      const doc = t?.documentoIdentidad ?? t?.numeroDocumento ?? '-';
      const razon = emp?.nombre ?? null;
      if (!byTrabajador.has(tid)) {
        byTrabajador.set(tid, { nombre, doc, razon: razon ?? '', items: 0, costo: 0 });
      }
      const rec = byTrabajador.get(tid)!;
      for (const det of s.detalles || []) {
        if (det.exceptuado) continue;
        const epp = det.epp as any;
        const qty = det.cantidad || 1;
        const costoUnit = epp?.costo ? Number(epp.costo) : 0;
        rec.items += qty;
        rec.costo += qty * costoUnit;
      }
    }

    return Array.from(byTrabajador.entries()).map(([trabajador_id, rec]) => ({
      trabajador_id,
      trabajador_nombre: rec.nombre,
      nro_documento: rec.doc,
      razon_social: rec.razon,
      total_items: rec.items,
      costo_total: Math.round(rec.costo * 100) / 100,
    }));
  }
}
