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
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { ConfigEppService } from '../config-epp/config-epp.service';
import { EppPdfService } from './epp-pdf.service';
import { StorageService } from '../../common/services/storage.service';
import { UsuariosService } from '../usuarios/usuarios.service';

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
    private readonly configEppService: ConfigEppService,
    private readonly eppPdfService: EppPdfService,
    private readonly storageService: StorageService,
    private readonly usuariosService: UsuariosService,
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
    return this.storageService.uploadFile(ruc, buffer, 'imagen_epp', { contentType: mimetype });
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
    return this.storageService.uploadFile(ruc, buffer, 'ficha_pdf_epp', { contentType: 'application/pdf' });
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

  async findAllEpp(empresaId?: string, empresaIds?: string[]): Promise<ResponseEppDto[]> {
    const qb = this.eppRepository.createQueryBuilder('e').orderBy('e.nombre', 'ASC');
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

  async updateEpp(id: string, dto: UpdateEppDto): Promise<ResponseEppDto> {
    const epp = await this.eppRepository.findOne({ where: { id } });

    if (!epp) {
      throw new NotFoundException(`EPP con ID ${id} no encontrado`);
    }

    if (dto.nombre !== undefined) epp.nombre = dto.nombre;
    if (dto.tipo_proteccion !== undefined) epp.tipoProteccion = dto.tipo_proteccion;
    if (dto.categoria !== undefined) epp.categoria = dto.categoria;
    if (dto.descripcion !== undefined) epp.descripcion = dto.descripcion ?? null;
    if (dto.imagen_url !== undefined) {
      const u = dto.imagen_url;
      epp.imagenUrl = u != null ? (this.storageService.getCanonicalUrl(u) || u) : null;
    }
    if (dto.vigencia !== undefined) epp.vigencia = dto.vigencia ?? null;
    if (dto.costo !== undefined) epp.costo = dto.costo ?? null;
    if (dto.categoria_criticidad !== undefined) epp.categoriaCriticidad = dto.categoria_criticidad ?? null;
    if (dto.adjunto_pdf_url !== undefined) {
      const u = dto.adjunto_pdf_url;
      epp.adjuntoPdfUrl = u != null ? (this.storageService.getCanonicalUrl(u) || u) : null;
    }

    const saved = await this.eppRepository.save(epp);
    return this.applySignedUrls(ResponseEppDto.fromEntity(saved));
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

  async create(dto: CreateSolicitudEppDto): Promise<ResponseSolicitudEppDto> {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('Debe incluir al menos un item de EPP');
    }

    // Generar código correlativo
    const year = new Date().getFullYear();
    const count = await this.solicitudRepository.count({
      where: { empresaId: dto.empresa_id },
    });
    const codigoCorrelativo = `EPP-${year}-${String(count + 1).padStart(4, '0')}`;

    // Crear solicitud
    const solicitud = this.solicitudRepository.create({
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

    const saved = await this.solicitudRepository.save(solicitud);

    // Crear detalles
    const detalles = dto.detalles.map((detalleDto) =>
      this.detalleRepository.create({
        solicitudEppId: saved.id,
        eppId: detalleDto.epp_id,
        cantidad: detalleDto.cantidad,
      }),
    );

    await this.detalleRepository.save(detalles);

    return this.findOne(saved.id);
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

    return solicitudes.map((s) => ResponseSolicitudEppDto.fromEntity(s));
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

    return ResponseSolicitudEppDto.fromEntity(solicitud);
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

    if (epp.empresaId !== solicitud.empresaId) {
      throw new BadRequestException('El EPP debe pertenecer a la misma empresa que la solicitud');
    }

    const detalle = this.detalleRepository.create({
      solicitudEppId: solicitudId,
      eppId,
      cantidad: Math.max(1, cantidad),
      agregado: true,
      agregadoPorId: usuarioId ?? null,
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
      const base64Data = opts.firmaRecepcionBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const empresa = await this.empresaRepository.findOne({ where: { id: solicitud.empresaId } });
      const rucEmpresa = (empresa as any)?.ruc ?? 'sistema';
      if (this.storageService.isAvailable()) {
        firmaRecepcionUrl = await this.storageService.uploadFile(
          rucEmpresa,
          buffer,
          'firma_recepcion',
          { filename: `firma-recepcion-${solicitud.id}.png` },
        );
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
      }

      const solicitudConDetalles = await this.solicitudRepository.findOne({
        where: { id },
        relations: [
          'detalles',
          'detalles.epp',
          'solicitante',
          'solicitante.area',
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
            await this.detalleRepository.save(det);
          }
        }

        try {
          const { buffer } = await this.eppPdfService.generateRegistroEntregaPdf(solicitudConDetalles);
          const empresa = solicitudConDetalles.empresa as any;
          const rucEmpresa = empresa?.ruc ?? 'sistema';
          if (this.storageService.isAvailable()) {
            solicitud.registroEntregaPdfUrl = await this.storageService.uploadFile(
              rucEmpresa,
              buffer,
              'pdf_entrega',
              { filename: `registro-${solicitud.id}.pdf` },
            );
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
            'empresa',
            'entregadoPor',
            'entregadoPor.trabajador',
          ],
          order: { fechaEntrega: 'ASC' },
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
          return dA - dB;
        });
        try {
          const trabajador = solicitudConDetalles.solicitante;
          const kardexBuffer = await this.eppPdfService.generateKardexPdfPorTrabajador(
            trabajador,
            entregasParaKardex,
          );
          const rucEmpresa = (solicitudConDetalles.empresa as any)?.ruc ?? 'sistema';
          const trabajadorEntity = await this.trabajadorRepository.findOne({
            where: { id: trabajadorId },
          });
          if (trabajadorEntity) {
            if (this.storageService.isAvailable()) {
              // Nombre único por generación para que la URL referencie siempre el último kardex
              const timestamp = Date.now();
              trabajadorEntity.kardexPdfUrl = await this.storageService.uploadFile(
                rucEmpresa,
                kardexBuffer,
                'kardex_pdf',
                { filename: `kardex-${trabajadorId}-${timestamp}.pdf` },
              );
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
      where: { solicitanteId: trabajadorId },
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
      order: { fechaSolicitud: 'DESC' },
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
        razon_social: emp?.nombre ?? null,
        unidad: t?.unidad ?? null,
        area: area?.nombre ?? null,
        sede: t?.sede ?? null,
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
          'empresa',
          'entregadoPor',
          'entregadoPor.trabajador',
        ],
        order: { fechaEntrega: 'ASC' },
      });
      const detallesCount = todasEntregas.reduce((s, sol) => s + (sol.detalles?.filter((d) => !d.exceptuado).length ?? 0), 0);
      if (detallesCount === 0) {
        throw new NotFoundException(
          'No hay entregas registradas para este trabajador. El kardex se genera al marcar una solicitud como entregada.',
        );
      }
      const kardexBuffer = await this.eppPdfService.generateKardexPdfPorTrabajador(
        trabajador,
        todasEntregas,
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
}
