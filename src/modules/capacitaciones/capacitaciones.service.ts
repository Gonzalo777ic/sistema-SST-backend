import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Capacitacion, EstadoCapacitacion } from './entities/capacitacion.entity';
import { AsistenciaCapacitacion } from './entities/asistencia-capacitacion.entity';
import { ExamenCapacitacion } from './entities/examen-capacitacion.entity';
import { ResultadoExamen } from './entities/resultado-examen.entity';
import { CertificadoCapacitacion } from './entities/certificado-capacitacion.entity';
import { AdjuntoCapacitacion } from './entities/adjunto-capacitacion.entity';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { ResponseCapacitacionDto } from './dto/response-capacitacion.dto';
import { CreateExamenCapacitacionDto } from './dto/create-examen-capacitacion.dto';
import { CreateResultadoExamenDto } from './dto/create-resultado-examen.dto';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { randomUUID } from 'crypto';
import { StorageService } from '../../common/services/storage.service';
import { Empresa } from '../empresas/entities/empresa.entity';
import { EvaluacionFavorita } from './entities/evaluacion-favorita.entity';
import { CreateEvaluacionFavoritaDto } from './dto/create-evaluacion-favorita.dto';

@Injectable()
export class CapacitacionesService {
  constructor(
    @InjectRepository(Capacitacion)
    private readonly capacitacionRepository: Repository<Capacitacion>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(AdjuntoCapacitacion)
    private readonly adjuntoRepository: Repository<AdjuntoCapacitacion>,
    private readonly storageService: StorageService,
    @InjectRepository(AsistenciaCapacitacion)
    private readonly asistenciaRepository: Repository<AsistenciaCapacitacion>,
    @InjectRepository(ExamenCapacitacion)
    private readonly examenRepository: Repository<ExamenCapacitacion>,
    @InjectRepository(ResultadoExamen)
    private readonly resultadoRepository: Repository<ResultadoExamen>,
    @InjectRepository(CertificadoCapacitacion)
    private readonly certificadoRepository: Repository<CertificadoCapacitacion>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(EvaluacionFavorita)
    private readonly evaluacionFavoritaRepository: Repository<EvaluacionFavorita>,
  ) {}

  async create(
    dto: CreateCapacitacionDto,
    currentUser?: { id: string; empresaId?: string | null },
  ): Promise<ResponseCapacitacionDto> {
    const empresaId = dto.empresa_id ?? currentUser?.empresaId ?? null;
    if (!empresaId) {
      throw new BadRequestException('Se requiere empresa_id o el usuario debe tener empresa asignada');
    }

    if (dto.hora_inicio && dto.hora_fin && dto.hora_fin <= dto.hora_inicio) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }

    let duracionHoras: number | null = dto.duracion_horas ?? null;
    let duracionMinutos: number | null = dto.duracion_minutos ?? null;
    if (dto.duracion_hhmm) {
      const [h, m] = dto.duracion_hhmm.split(':').map(Number);
      duracionMinutos = (h || 0) * 60 + (m || 0);
      duracionHoras = duracionMinutos / 60;
    }

    let firmaUrl: string | null = null;
    if (dto.firma_capacitador_url?.startsWith('data:image/') && this.storageService.isAvailable()) {
      const base64Data = dto.firma_capacitador_url.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
      const ruc = empresa?.ruc ?? 'sistema';
      firmaUrl = await this.storageService.uploadFile(ruc, buffer, 'firma_capacitador', {
        filename: `firma-cap-${randomUUID()}.png`,
      });
    } else if (dto.firma_capacitador_url && !dto.firma_capacitador_url.startsWith('data:')) {
      firmaUrl = dto.firma_capacitador_url;
    }

    const capacitacion = this.capacitacionRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      lugar: dto.lugar || null,
      tipo: dto.tipo,
      fecha: new Date(dto.fecha),
      fechaFin: dto.fecha_fin ? new Date(dto.fecha_fin) : null,
      sede: dto.sede || null,
      unidad: dto.unidad || null,
      area: dto.area || null,
      grupo: dto.grupo || null,
      instrucciones: dto.instrucciones || null,
      horaInicio: dto.hora_inicio || null,
      horaFin: dto.hora_fin || null,
      duracionHoras: duracionHoras ?? undefined,
      duracionMinutos: duracionMinutos ?? undefined,
      instructorId: dto.instructor_id ?? null,
      instructorNombre: dto.instructor ?? null,
      firmaCapacitadorUrl: firmaUrl,
      materialUrl: dto.material_url ?? null,
      certificadoUrl: dto.certificado_url ?? null,
      estado: dto.estado ?? EstadoCapacitacion.Pendiente,
      empresaId,
      creadoPorId: dto.creado_por_id,
    } as any);

    const saved = (await this.capacitacionRepository.save(capacitacion)) as unknown as Capacitacion;

    // Guardar participantes
    if (dto.participantes && dto.participantes.length > 0) {
      const asistencias = await Promise.all(
        dto.participantes.map(async (p) => {
          const trabajador = await this.trabajadorRepository.findOne({
            where: { id: p.trabajador_id },
          });

          return this.asistenciaRepository.create({
            capacitacionId: saved.id,
            trabajadorId: p.trabajador_id,
            nombreSnapshot: p.nombre,
            asistencia: p.asistencia ?? false,
            calificacion: p.calificacion ?? null,
            aprobado: p.aprobado ?? false,
            firmo: (p as any).firmo ?? false,
          });
        }),
      );
      await this.asistenciaRepository.save(asistencias);
    }

    return this.findOne(saved.id);
  }

  async findAll(filters?: {
    empresaId?: string;
    tipo?: string;
    tema?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
    razonSocial?: string;
    grupo?: string;
    area?: string;
    responsable?: string;
    unidad?: string;
  }): Promise<ResponseCapacitacionDto[]> {
    const qb = this.capacitacionRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.asistencias', 'asistencias')
      .leftJoinAndSelect('c.creadoPor', 'creadoPor')
      .leftJoinAndSelect('c.examenes', 'examenes')
      .leftJoinAndSelect('c.empresa', 'empresa')
      .orderBy('c.fecha', 'DESC');

    if (filters?.empresaId) {
      qb.andWhere('c.empresaId = :empresaId', { empresaId: filters.empresaId });
    }
    if (filters?.tipo) {
      qb.andWhere('c.tipo = :tipo', { tipo: filters.tipo });
    }
    if (filters?.tema) {
      qb.andWhere('c.titulo ILIKE :tema', { tema: `%${filters.tema}%` });
    }
    if (filters?.fechaDesde) {
      qb.andWhere('c.fecha >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }
    if (filters?.fechaHasta) {
      qb.andWhere('c.fecha <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }
    if (filters?.estado) {
      qb.andWhere('c.estado = :estado', { estado: filters.estado });
    }
    if (filters?.unidad) {
      qb.andWhere('c.unidad ILIKE :unidad', { unidad: `%${filters.unidad}%` });
    }
    if (filters?.responsable) {
      qb.andWhere(
        '(creadoPor.nombres ILIKE :responsable OR creadoPor.dni ILIKE :responsable)',
        { responsable: `%${filters.responsable}%` },
      );
    }
    if (filters?.razonSocial) {
      qb.andWhere('empresa.nombre ILIKE :razonSocial', {
        razonSocial: `%${filters.razonSocial}%`,
      });
    }

    const capacitaciones = await qb.getMany();
    return capacitaciones.map((c) => ResponseCapacitacionDto.fromEntity(c as any));
  }

  async findOne(id: string): Promise<ResponseCapacitacionDto> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id },
      relations: ['asistencias', 'creadoPor', 'examenes', 'empresa'],
    });

    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${id} no encontrada`);
    }

    const dto = ResponseCapacitacionDto.fromEntity(capacitacion as any);
    const resultados = await this.resultadoRepository.find({ where: { capacitacionId: id } });
    dto.participantes = dto.participantes.map((p) => ({
      ...p,
      rendio_examen: resultados.some((r) => r.trabajadorId === p.trabajador_id),
    }));
    return dto;
  }

  async update(
    id: string,
    dto: UpdateCapacitacionDto,
  ): Promise<ResponseCapacitacionDto> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id },
      relations: ['asistencias', 'empresa'],
    });

    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${id} no encontrada`);
    }

    if (dto.firma_capacitador_url?.startsWith('data:image/') && this.storageService.isAvailable()) {
      const base64Data = dto.firma_capacitador_url.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const ruc = (capacitacion.empresa as any)?.ruc ?? 'sistema';
      capacitacion.firmaCapacitadorUrl = await this.storageService.uploadFile(ruc, buffer, 'firma_capacitador', {
        filename: `firma-cap-${id}.png`,
      });
    } else if (dto.firma_capacitador_url !== undefined) {
      capacitacion.firmaCapacitadorUrl = dto.firma_capacitador_url || null;
    }

    if (capacitacion.estado === EstadoCapacitacion.Cancelada && dto.participantes) {
      throw new BadRequestException(
        'No se pueden agregar participantes a una capacitación cancelada',
      );
    }

    let duracionHoras: number | null = dto.duracion_horas ?? capacitacion.duracionHoras;
    let duracionMinutos: number | null = dto.duracion_minutos ?? capacitacion.duracionMinutos;
    if (dto.duracion_hhmm) {
      const [h, m] = dto.duracion_hhmm.split(':').map(Number);
      duracionMinutos = (h || 0) * 60 + (m || 0);
      duracionHoras = duracionMinutos / 60;
    }

    // Actualizar campos
    Object.assign(capacitacion, {
      titulo: dto.titulo ?? capacitacion.titulo,
      descripcion: dto.descripcion ?? capacitacion.descripcion,
      lugar: dto.lugar ?? capacitacion.lugar,
      tipo: dto.tipo ?? capacitacion.tipo,
      fecha: dto.fecha ? new Date(dto.fecha) : capacitacion.fecha,
      fechaFin: dto.fecha_fin ? new Date(dto.fecha_fin) : capacitacion.fechaFin,
      sede: dto.sede ?? capacitacion.sede,
      unidad: dto.unidad ?? capacitacion.unidad,
      area: dto.area ?? capacitacion.area,
      grupo: dto.grupo ?? capacitacion.grupo,
      instrucciones: dto.instrucciones ?? capacitacion.instrucciones,
      horaInicio: dto.hora_inicio ?? capacitacion.horaInicio,
      horaFin: dto.hora_fin ?? capacitacion.horaFin,
      duracionHoras: duracionHoras ?? capacitacion.duracionHoras,
      duracionMinutos: duracionMinutos ?? capacitacion.duracionMinutos,
      instructorId: dto.instructor_id ?? capacitacion.instructorId,
      instructorNombre: dto.instructor ?? capacitacion.instructorNombre,
      materialUrl: dto.material_url ?? capacitacion.materialUrl,
      certificadoUrl: dto.certificado_url ?? capacitacion.certificadoUrl,
      estado: dto.estado ?? capacitacion.estado,
    });
    if (dto.empresa_id) {
      capacitacion.empresaId = dto.empresa_id;
    }

    await this.capacitacionRepository.save(capacitacion);

    // Actualizar participantes si se proporcionan
    if (dto.participantes) {
      await this.asistenciaRepository.delete({ capacitacionId: id });
      if (dto.participantes.length > 0) {
        const asistencias = await Promise.all(
          dto.participantes.map(async (p) => {
          return this.asistenciaRepository.create({
            capacitacionId: id,
            trabajadorId: p.trabajador_id,
            nombreSnapshot: p.nombre,
            asistencia: p.asistencia ?? false,
            calificacion: p.calificacion ?? null,
            aprobado: p.aprobado ?? false,
            firmo: (p as any).firmo ?? false,
          });
          }),
        );
        await this.asistenciaRepository.save(asistencias);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id },
    });

    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${id} no encontrada`);
    }

    // Soft delete
    capacitacion.estado = EstadoCapacitacion.Cancelada;
    capacitacion.fechaEliminacion = new Date();
    await this.capacitacionRepository.save(capacitacion);
  }

  async crearExamen(dto: CreateExamenCapacitacionDto): Promise<ExamenCapacitacion> {
    const examen = this.examenRepository.create({
      capacitacionId: dto.capacitacion_id,
      titulo: dto.titulo,
      duracionMinutos: dto.duracion_minutos ?? 30,
      puntajeMinimoAprobacion: dto.puntaje_minimo_aprobacion ?? 70,
      preguntas: dto.preguntas,
    });

    return this.examenRepository.save(examen);
  }

  async rendirExamen(dto: CreateResultadoExamenDto): Promise<ResultadoExamen> {
    const examen = await this.examenRepository.findOne({
      where: { id: dto.examen_id },
    });

    if (!examen) {
      throw new NotFoundException(`Examen con ID ${dto.examen_id} no encontrado`);
    }

    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: dto.trabajador_id },
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${dto.trabajador_id} no encontrado`);
    }

    // Calcular puntaje
    let puntajeTotal = 0;
    let puntajeObtenido = 0;

    const respuestas = dto.respuestas.map((r) => {
      const pregunta = examen.preguntas[r.pregunta_index];
      if (!pregunta) {
        throw new BadRequestException(
          `Pregunta con índice ${r.pregunta_index} no existe`,
        );
      }

      puntajeTotal += pregunta.puntaje;
      const esCorrecta =
        pregunta.respuesta_correcta_index === r.respuesta_seleccionada;
      if (esCorrecta) {
        puntajeObtenido += pregunta.puntaje;
      }

      return {
        pregunta_index: r.pregunta_index,
        respuesta_seleccionada: r.respuesta_seleccionada,
        es_correcta: esCorrecta,
      };
    });

    const puntajePorcentaje = (puntajeObtenido / puntajeTotal) * 100;
    const aprobado = puntajePorcentaje >= examen.puntajeMinimoAprobacion;

    const resultado = this.resultadoRepository.create({
      examenId: dto.examen_id,
      capacitacionId: examen.capacitacionId,
      trabajadorId: dto.trabajador_id,
      fechaExamen: new Date(),
      puntajeObtenido: puntajePorcentaje,
      aprobado,
      respuestas,
      trabajadorNombre: trabajador.nombreCompleto,
      trabajadorDocumento: trabajador.documentoIdentidad,
      trabajadorEmail: trabajador.emailPersonal,
    });

    const saved = await this.resultadoRepository.save(resultado);

    // Generar certificado si aprobó
    if (aprobado) {
      const capacitacion = await this.capacitacionRepository.findOne({
        where: { id: examen.capacitacionId },
      });

      if (capacitacion) {
        const numeroCertificado = await this.generarNumeroCertificado();
        const duracionH = capacitacion.duracionHoras ?? (capacitacion.duracionMinutos != null ? capacitacion.duracionMinutos / 60 : 0);
        const certificado = this.certificadoRepository.create({
          numeroCertificado,
          capacitacionId: capacitacion.id,
          capacitacionTitulo: capacitacion.titulo,
          fechaCapacitacion: capacitacion.fecha,
          duracionHoras: duracionH,
          instructor: capacitacion.instructorNombre || 'N/A',
          puntajeExamen: puntajePorcentaje,
          trabajadorId: trabajador.id,
          trabajadorNombre: trabajador.nombreCompleto,
          trabajadorDocumento: trabajador.documentoIdentidad,
          trabajadorEmail: trabajador.emailPersonal,
          resultadoExamenId: saved.id,
        });

        await this.certificadoRepository.save(certificado);
      }
    }

    return saved;
  }

  async generarNumeroCertificado(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CERT-${year}-`;

    // Buscar el último certificado del año
    const ultimoCertificado = await this.certificadoRepository
      .createQueryBuilder('certificado')
      .where('certificado.numeroCertificado LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('certificado.numeroCertificado', 'DESC')
      .getOne();

    let siguienteNumero = 1;
    if (ultimoCertificado) {
      const ultimoNumero = parseInt(
        ultimoCertificado.numeroCertificado.replace(prefix, ''),
        10,
      );
      siguienteNumero = ultimoNumero + 1;
    }

    return `${prefix}${siguienteNumero.toString().padStart(6, '0')}`;
  }

  async actualizarAsistencia(
    capacitacionId: string,
    trabajadorId: string,
    asistencia: boolean,
    calificacion?: number,
    aprobado?: boolean,
    firmo?: boolean,
  ): Promise<void> {
    const asistenciaRecord = await this.asistenciaRepository.findOne({
      where: { capacitacionId, trabajadorId },
    });

    if (!asistenciaRecord) {
      throw new NotFoundException('Asistencia no encontrada');
    }

    asistenciaRecord.asistencia = asistencia;
    if (calificacion !== undefined) {
      asistenciaRecord.calificacion = calificacion;
      // Nota sobre 20: aprobado si calificacion >= 11 (configurable)
      asistenciaRecord.aprobado = aprobado ?? (calificacion >= 11);
    }
    if (aprobado !== undefined) asistenciaRecord.aprobado = aprobado;
    if (firmo !== undefined) asistenciaRecord.firmo = firmo;

    await this.asistenciaRepository.save(asistenciaRecord);
  }

  async retirarParticipante(
    capacitacionId: string,
    trabajadorId: string,
  ): Promise<ResponseCapacitacionDto> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id: capacitacionId },
      relations: ['empresa'],
    });
    if (!capacitacion) throw new NotFoundException('Capacitación no encontrada');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(capacitacion.fecha);
    fechaEvento.setHours(0, 0, 0, 0);
    if (hoy > fechaEvento) {
      throw new BadRequestException(
        'No se puede retirar participantes después de la fecha del evento',
      );
    }

    const resultadoExamen = await this.resultadoRepository.findOne({
      where: { capacitacionId, trabajadorId },
    });
    if (resultadoExamen) {
      throw new BadRequestException(
        'No se puede retirar al trabajador porque ya rindió el examen',
      );
    }

    await this.asistenciaRepository.delete({ capacitacionId, trabajadorId });
    return this.findOne(capacitacionId);
  }

  async obtenerUrlCertificado(
    capacitacionId: string,
    trabajadorId: string,
  ): Promise<{ url: string } | null> {
    const cert = await this.certificadoRepository.findOne({
      where: { capacitacionId, trabajadorId },
    });
    if (!cert?.pdfUrl) return null;
    if (this.storageService.isAvailable() && cert.pdfUrl.includes('storage.googleapis.com')) {
      const url = await this.storageService.getSignedUrl(cert.pdfUrl, 60 * 60); // 1h
      return { url };
    }
    return { url: cert.pdfUrl };
  }

  async obtenerResultadoEvaluacion(
    capacitacionId: string,
    trabajadorId: string,
  ): Promise<{
    trabajador: { nombre: string; documento: string; unidad?: string; area?: string };
    capacitacion: { titulo: string; fecha: string; instructor: string };
    empresa: { nombre: string };
    nota: number;
    fecha_examen: string;
    hora_inicio?: string;
    hora_fin?: string;
    respuestas: Array<{ pregunta: string; respuesta: string; correcto: boolean }>;
  } | null> {
    const resultado = await this.resultadoRepository.findOne({
      where: { capacitacionId, trabajadorId },
      relations: ['examen', 'trabajador', 'capacitacion', 'capacitacion.empresa'],
    });
    if (!resultado) return null;

    const examen = resultado.examen as any;
    const cap = resultado.capacitacion as any;
    const trab = resultado.trabajador as any;
    const preguntas = examen?.preguntas ?? [];

    const respuestas = (resultado.respuestas ?? []).map((r: any) => {
      const p = preguntas[r.pregunta_index];
      const opciones = p?.opciones ?? [];
      return {
        pregunta: p?.texto_pregunta ?? '',
        respuesta: opciones[r.respuesta_seleccionada] ?? '',
        correcto: r.es_correcta,
      };
    });

    const nota = Math.round((Number(resultado.puntajeObtenido) / 100) * 20);
    const fechaExamen = resultado.fechaExamen instanceof Date ? resultado.fechaExamen : new Date(resultado.fechaExamen);

    return {
      trabajador: {
        nombre: trab?.nombreCompleto ?? resultado.trabajadorNombre,
        documento: resultado.trabajadorDocumento,
        unidad: trab?.unidad ?? cap?.unidad,
        area: trab?.area_nombre ?? trab?.area?.nombre,
      },
      capacitacion: {
        titulo: cap?.titulo ?? '',
        fecha: cap?.fecha ? new Date(cap.fecha).toISOString().split('T')[0] : '',
        instructor: cap?.instructorNombre ?? '',
      },
      empresa: { nombre: (cap?.empresa as any)?.nombre ?? '' },
      nota,
      fecha_examen: fechaExamen.toISOString().split('T')[0],
      hora_inicio: fechaExamen.toTimeString().slice(0, 5),
      hora_fin: fechaExamen.toTimeString().slice(0, 5),
      respuestas,
    };
  }

  async agregarParticipante(
    capacitacionId: string,
    trabajadorId: string,
  ): Promise<ResponseCapacitacionDto> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id: capacitacionId },
      relations: ['asistencias', 'empresa'],
    });
    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${capacitacionId} no encontrada`);
    }
    if (capacitacion.estado === EstadoCapacitacion.Cancelada) {
      throw new BadRequestException('No se pueden agregar participantes a una capacitación cancelada');
    }
    const yaAsignado = capacitacion.asistencias?.some((a) => a.trabajadorId === trabajadorId);
    if (yaAsignado) {
      throw new BadRequestException('El trabajador ya está asignado a esta capacitación');
    }
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: trabajadorId },
    });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${trabajadorId} no encontrado`);
    }
    const asistencia = this.asistenciaRepository.create({
      capacitacionId,
      trabajadorId,
      nombreSnapshot: trabajador.nombreCompleto,
      asistencia: false,
      aprobado: false,
    });
    await this.asistenciaRepository.save(asistencia);
    return this.findOne(capacitacionId);
  }

  async obtenerAdjuntos(capacitacionId: string): Promise<{ id: string; titulo: string; archivo_url: string; nombre_archivo: string; fecha_registro: string; registrado_por: string }[]> {
    const adjuntos = await this.adjuntoRepository.find({
      where: { capacitacionId },
      relations: ['registradoPor'],
      order: { createdAt: 'DESC' },
    });
    return adjuntos.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      archivo_url: a.archivoUrl,
      nombre_archivo: a.nombreArchivo,
      fecha_registro: a.createdAt.toISOString().split('T')[0],
      registrado_por: (a.registradoPor as any)
        ? [(a.registradoPor as any).nombres, (a.registradoPor as any).apellidoPaterno, (a.registradoPor as any).apellidoMaterno].filter(Boolean).join(' ') || '-'
        : '-',
    }));
  }

  async crearAdjunto(
    capacitacionId: string,
    titulo: string,
    buffer: Buffer,
    mimetype: string,
    nombreArchivo: string,
    registradoPorId: string,
  ): Promise<{ id: string }> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id: capacitacionId },
      relations: ['empresa'],
    });
    if (!capacitacion) throw new NotFoundException('Capacitación no encontrada');

    const ruc = (capacitacion.empresa as any)?.ruc ?? 'sistema';
    const url = await this.storageService.uploadFile(ruc, buffer, 'adjunto_capacitacion', {
      contentType: mimetype,
      filename: `${randomUUID()}-${nombreArchivo.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    });

    const adjunto = this.adjuntoRepository.create({
      titulo,
      archivoUrl: url,
      nombreArchivo,
      capacitacionId,
      registradoPorId,
    });
    const saved = await this.adjuntoRepository.save(adjunto);
    return { id: saved.id };
  }

  async eliminarAdjunto(adjuntoId: string): Promise<void> {
    const adjunto = await this.adjuntoRepository.findOne({ where: { id: adjuntoId } });
    if (!adjunto) throw new NotFoundException('Adjunto no encontrado');
    await this.adjuntoRepository.remove(adjunto);
  }

  async obtenerExamenesPorCapacitacion(
    capacitacionId: string,
  ): Promise<ExamenCapacitacion[]> {
    return this.examenRepository.find({
      where: { capacitacionId, activo: true },
      relations: ['resultados'],
    });
  }

  async obtenerEvaluacionesFavoritas(empresaId?: string | null): Promise<{ id: string; nombre: string; preguntas: any[] }[]> {
    const qb = this.evaluacionFavoritaRepository
      .createQueryBuilder('e')
      .orderBy('e.createdAt', 'DESC');
    if (empresaId) {
      qb.andWhere('(e.empresa_id = :empresaId OR e.empresa_id IS NULL)', { empresaId });
    }
    const list = await qb.getMany();
    return list.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      preguntas: e.preguntas,
    }));
  }

  async crearEvaluacionFavorita(
    dto: CreateEvaluacionFavoritaDto,
    creadoPorId: string,
    empresaId?: string | null,
  ): Promise<{ id: string }> {
    const ev = this.evaluacionFavoritaRepository.create({
      nombre: dto.nombre,
      preguntas: dto.preguntas,
      empresaId: dto.empresa_id ?? empresaId ?? null,
      creadoPorId,
    });
    const saved = await this.evaluacionFavoritaRepository.save(ev);
    return { id: saved.id };
  }

  async eliminarEvaluacionFavorita(id: string): Promise<void> {
    const ev = await this.evaluacionFavoritaRepository.findOne({ where: { id } });
    if (!ev) throw new NotFoundException('Evaluación favorita no encontrada');
    await this.evaluacionFavoritaRepository.remove(ev);
  }
}
