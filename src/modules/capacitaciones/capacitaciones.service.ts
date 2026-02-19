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
import { Trabajador, EstadoTrabajador } from '../trabajadores/entities/trabajador.entity';
import { randomUUID } from 'crypto';
import { StorageService } from '../../common/services/storage.service';
import { Empresa } from '../empresas/entities/empresa.entity';
import { EvaluacionFavorita } from './entities/evaluacion-favorita.entity';
import { CreateEvaluacionFavoritaDto } from './dto/create-evaluacion-favorita.dto';
import { ResultadoEvaluacionPaso } from './entities/resultado-evaluacion-paso.entity';
import { ConfigCapacitacionesService } from '../config-capacitaciones/config-capacitaciones.service';
import { EvaluarPasoDto } from './dto/evaluar-paso.dto';
import { CertificadoCapacitacionPdfService } from './certificado-capacitacion-pdf.service';
import { FirmasGerenteService } from '../empresas/firmas-gerente.service';

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
    @InjectRepository(ResultadoEvaluacionPaso)
    private readonly resultadoEvaluacionPasoRepository: Repository<ResultadoEvaluacionPaso>,
    @InjectRepository(CertificadoCapacitacion)
    private readonly certificadoRepository: Repository<CertificadoCapacitacion>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(EvaluacionFavorita)
    private readonly evaluacionFavoritaRepository: Repository<EvaluacionFavorita>,
    private readonly configCapacitacionesService: ConfigCapacitacionesService,
    private readonly certificadoPdfService: CertificadoCapacitacionPdfService,
    private readonly firmasGerenteService: FirmasGerenteService,
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

    let responsableRegistroFirmaUrl: string | null = null;
    if (dto.responsable_registro_firma_url?.startsWith('data:image/') && this.storageService.isAvailable()) {
      const base64Data = dto.responsable_registro_firma_url.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > 2 * 1024 * 1024) {
        throw new BadRequestException('La imagen de firma del responsable de registro no debe superar 2 MB');
      }
      const empresa = await this.empresaRepository.findOne({ where: { id: empresaId } });
      const ruc = empresa?.ruc ?? 'sistema';
      responsableRegistroFirmaUrl = await this.storageService.uploadFile(ruc, buffer, 'firma_capacitador', {
        filename: `firma-registro-${randomUUID()}.png`,
      });
    } else if (dto.responsable_registro_firma_url && !dto.responsable_registro_firma_url.startsWith('data:')) {
      responsableRegistroFirmaUrl = dto.responsable_registro_firma_url;
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
      responsableRegistroNombre: dto.responsable_registro_nombre ?? null,
      responsableRegistroFirmaUrl: responsableRegistroFirmaUrl,
      responsableRrhhGerenteId: dto.responsable_rrhh_gerente_id ?? null,
      responsableRegistroGerenteId: dto.responsable_registro_gerente_id ?? null,
      responsableCertificacionGerenteId: dto.responsable_certificacion_gerente_id ?? null,
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
    sede?: string;
    gerencia?: string;
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
    if (filters?.sede) {
      qb.andWhere('c.sede ILIKE :sede', { sede: `%${filters.sede}%` });
    }
    if (filters?.grupo) {
      qb.andWhere('c.grupo ILIKE :grupo', { grupo: `%${filters.grupo}%` });
    }
    if (filters?.area) {
      qb.andWhere('c.area ILIKE :area', { area: `%${filters.area}%` });
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

  async findMisCapacitaciones(
    trabajadorId: string,
    filters?: {
      estadoRegistro?: string; // 'pendiente' | 'completado'
      grupo?: string;
      tipo?: string;
    },
  ): Promise<ResponseCapacitacionDto[]> {
    const qb = this.capacitacionRepository
      .createQueryBuilder('c')
      .innerJoin('c.asistencias', 'a', 'a.trabajadorId = :trabajadorId', { trabajadorId })
      .leftJoinAndSelect('c.asistencias', 'asistencias')
      .leftJoinAndSelect('c.creadoPor', 'creadoPor')
      .leftJoinAndSelect('c.examenes', 'examenes')
      .leftJoinAndSelect('c.empresa', 'empresa')
      .andWhere('c.estado = :estadoProgramada', { estadoProgramada: EstadoCapacitacion.Programada })
      .orderBy('c.fecha', 'DESC');

    if (filters?.grupo) {
      qb.andWhere('c.grupo = :grupo', { grupo: filters.grupo });
    }
    if (filters?.tipo) {
      qb.andWhere('c.tipo = :tipo', { tipo: filters.tipo });
    }

    const capacitaciones = await qb.getMany();
    const resultados = await this.resultadoRepository.find({
      where: { trabajadorId },
    });

    let dtos = capacitaciones.map((c) => ResponseCapacitacionDto.fromEntity(c as any));
    dtos = dtos.map((d) => {
      d.participantes = d.participantes.map((p) => ({
        ...p,
        rendio_examen: resultados.some(
          (r) => r.trabajadorId === p.trabajador_id && r.capacitacionId === d.id,
        ),
      }));
      return d;
    });

    if (filters?.estadoRegistro === 'pendiente') {
      dtos = dtos.filter((d) => {
        const p = d.participantes.find((x) => x.trabajador_id === trabajadorId);
        return p && !p.firmo;
      });
    } else if (filters?.estadoRegistro === 'completado') {
      dtos = dtos.filter((d) => {
        const p = d.participantes.find((x) => x.trabajador_id === trabajadorId);
        return p && p.firmo;
      });
    }

    return dtos;
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

    // Firmar URLs de GCS para que la imagen se cargue en el frontend (bucket privado)
    if (this.storageService.isAvailable()) {
      if (dto.firma_capacitador_url?.includes('storage.googleapis.com')) {
        dto.firma_capacitador_url = await this.storageService.getSignedUrl(dto.firma_capacitador_url, 60);
      }
      if (dto.responsable_registro_firma_url?.includes('storage.googleapis.com')) {
        dto.responsable_registro_firma_url = await this.storageService.getSignedUrl(dto.responsable_registro_firma_url, 60);
      }
    }

    return dto;
  }

  async findOneParaTrabajador(id: string, trabajadorId: string): Promise<ResponseCapacitacionDto> {
    const dto = await this.findOne(id);
    if (dto.estado !== EstadoCapacitacion.Programada) {
      throw new BadRequestException(
        'Esta capacitación aún no está disponible. Solo puedes acceder cuando esté en estado Programada.',
      );
    }
    const participante = dto.participantes?.find((p) => p.trabajador_id === trabajadorId);
    if (!participante) {
      throw new BadRequestException('No estás registrado en esta capacitación');
    }
    const inst = dto.instrucciones ?? [];
    dto.instrucciones = inst.map((p: any) => {
      if (!p.esEvaluacion || !Array.isArray(p.preguntas)) return p;
      return {
        ...p,
        preguntas: p.preguntas.map((pr: any) => ({
          texto_pregunta: pr.texto_pregunta,
          tipo: pr.tipo,
          opciones: pr.opciones,
        })),
      };
    });
    return dto;
  }

  async evaluarPaso(
    capacitacionId: string,
    trabajadorId: string,
    dto: EvaluarPasoDto,
  ): Promise<{
    aprobado: boolean;
    puntaje: number;
    puntaje_total: number;
    intentos_usados: number;
    intentos_restantes: number;
  }> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id: capacitacionId },
      relations: ['asistencias'],
    });
    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${capacitacionId} no encontrada`);
    }
    const isParticipant = capacitacion.asistencias?.some((a) => a.trabajadorId === trabajadorId);
    if (!isParticipant) {
      throw new BadRequestException('No estás registrado en esta capacitación');
    }
    const inst = (capacitacion.instrucciones ?? []) as any[];
    const paso = inst.find((p) => p.id === dto.paso_id);
    if (!paso || !paso.esEvaluacion || !Array.isArray(paso.preguntas) || paso.preguntas.length === 0) {
      throw new BadRequestException('Paso de evaluación no encontrado o sin preguntas');
    }
    const config = await this.configCapacitacionesService.getConfig();
    const intentosPrevios = await this.resultadoEvaluacionPasoRepository.count({
      where: { capacitacionId, trabajadorId, pasoId: dto.paso_id },
    });
    if (intentosPrevios >= config.limite_intentos) {
      throw new BadRequestException(
        `Has alcanzado el límite de ${config.limite_intentos} intentos para esta evaluación`,
      );
    }
    const aprobadoPrev = await this.resultadoEvaluacionPasoRepository.findOne({
      where: { capacitacionId, trabajadorId, pasoId: dto.paso_id, aprobado: true },
    });
    if (aprobadoPrev && config.bloquear_despues_aprobacion) {
      throw new BadRequestException('Ya aprobaste esta evaluación');
    }
    let puntajeTotal = 0;
    let puntajeObtenido = 0;
    const respuestas = dto.respuestas.map((r) => {
      const pregunta = paso.preguntas[r.pregunta_index];
      if (!pregunta) {
        throw new BadRequestException(`Pregunta con índice ${r.pregunta_index} no existe`);
      }
      const puntaje = Number(pregunta.puntaje ?? 1);
      puntajeTotal += puntaje;
      const esCorrecta = pregunta.respuesta_correcta_index === r.respuesta_seleccionada;
      if (esCorrecta) puntajeObtenido += puntaje;
      return {
        pregunta_index: r.pregunta_index,
        respuesta_seleccionada: r.respuesta_seleccionada,
        es_correcta: esCorrecta,
      };
    });
    const notaMin = config.nota_minima_aprobatoria ?? 11;
    const aprobado = puntajeTotal > 0 && (puntajeObtenido / puntajeTotal) * 20 >= notaMin;
    const resultado = this.resultadoEvaluacionPasoRepository.create({
      capacitacionId,
      trabajadorId,
      pasoId: dto.paso_id,
      intentoNum: intentosPrevios + 1,
      puntajeObtenido,
      puntajeTotal,
      aprobado,
      respuestas,
    });
    await this.resultadoEvaluacionPasoRepository.save(resultado);
    if (aprobado) {
      const asistencia = capacitacion.asistencias?.find((a) => a.trabajadorId === trabajadorId);
      if (asistencia) {
        asistencia.calificacion = (puntajeObtenido / puntajeTotal) * 20;
        asistencia.aprobado = true;
        await this.asistenciaRepository.save(asistencia);
      }
    }
    const intentosRestantes = Math.max(0, config.limite_intentos - intentosPrevios - 1);
    return {
      aprobado,
      puntaje: puntajeTotal > 0 ? (puntajeObtenido / puntajeTotal) * 20 : 0,
      puntaje_total: 20,
      intentos_usados: intentosPrevios + 1,
      intentos_restantes: intentosRestantes,
    };
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

    if (dto.responsable_registro_firma_url?.startsWith('data:image/') && this.storageService.isAvailable()) {
      const base64Data = dto.responsable_registro_firma_url.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > 2 * 1024 * 1024) {
        throw new BadRequestException('La imagen de firma del responsable de registro no debe superar 2 MB');
      }
      const ruc = (capacitacion.empresa as any)?.ruc ?? 'sistema';
      capacitacion.responsableRegistroFirmaUrl = await this.storageService.uploadFile(ruc, buffer, 'firma_capacitador', {
        filename: `firma-registro-${id}.png`,
      });
    } else if (dto.responsable_registro_firma_url !== undefined) {
      capacitacion.responsableRegistroFirmaUrl = dto.responsable_registro_firma_url || null;
    }
    if (dto.responsable_registro_nombre !== undefined) {
      capacitacion.responsableRegistroNombre = dto.responsable_registro_nombre || null;
    }
    if (dto.responsable_rrhh_gerente_id !== undefined) {
      capacitacion.responsableRrhhGerenteId = dto.responsable_rrhh_gerente_id || null;
    }
    if (dto.responsable_registro_gerente_id !== undefined) {
      capacitacion.responsableRegistroGerenteId = dto.responsable_registro_gerente_id || null;
    }
    if (dto.responsable_certificacion_gerente_id !== undefined) {
      capacitacion.responsableCertificacionGerenteId = dto.responsable_certificacion_gerente_id || null;
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
      (capacitacion as any).empresa = undefined;
    }

    if (capacitacion.estado === EstadoCapacitacion.Programada) {
        const errores: string[] = [];
        if (!capacitacion.instructorNombre?.trim()) {
          errores.push('El capacitador es obligatorio');
        }
        if (!capacitacion.firmaCapacitadorUrl?.trim()) {
          errores.push('La firma del capacitador es obligatoria');
        }
        if (!capacitacion.responsableRegistroGerenteId) {
          errores.push('Debe seleccionar un Responsable del registro');
        } else {
          const gReg = await this.firmasGerenteService.findByIdForCertificado(capacitacion.responsableRegistroGerenteId);
          if (!gReg?.firma_url?.trim()) {
            errores.push('El Responsable del registro debe tener firma registrada en Jerarquía Organizacional');
          }
        }
        if (!capacitacion.responsableCertificacionGerenteId) {
          errores.push('Debe seleccionar un Responsable de certificación');
        } else {
          const gCert = await this.firmasGerenteService.findByIdForCertificado(capacitacion.responsableCertificacionGerenteId);
          if (!gCert?.firma_url?.trim()) {
            errores.push('El Responsable de certificación debe tener firma registrada en Jerarquía Organizacional');
          }
        }
        if (errores.length > 0) {
          throw new BadRequestException(
            `Para programar la capacitación se requiere: ${errores.join('. ')}`,
          );
        }
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
      asistenciaRecord.aprobado = aprobado ?? (calificacion >= 11);
    }
    if (aprobado !== undefined) asistenciaRecord.aprobado = aprobado;
    if (firmo !== undefined) asistenciaRecord.firmo = firmo;

    await this.asistenciaRepository.save(asistenciaRecord);

    if (firmo && asistenciaRecord.aprobado) {
      const certExistente = await this.certificadoRepository.findOne({
        where: { capacitacionId, trabajadorId },
      });
      if (!certExistente) {
        const capacitacion = await this.capacitacionRepository.findOne({
          where: { id: capacitacionId },
          relations: ['empresa'],
        });
        const trabajador = await this.trabajadorRepository.findOne({
          where: { id: trabajadorId },
        });
        if (capacitacion && trabajador) {
          const nota = Number(asistenciaRecord.calificacion ?? 0);
          const numeroCertificado = await this.generarNumeroCertificado();
          const duracionH = capacitacion.duracionHoras ?? (capacitacion.duracionMinutos != null ? capacitacion.duracionMinutos / 60 : 0);
          const certificado = this.certificadoRepository.create({
            numeroCertificado,
            capacitacionId,
            capacitacionTitulo: capacitacion.titulo,
            fechaCapacitacion: capacitacion.fecha,
            duracionHoras: duracionH,
            instructor: capacitacion.instructorNombre || 'N/A',
            puntajeExamen: nota,
            trabajadorId,
            trabajadorNombre: trabajador.nombreCompleto,
            trabajadorDocumento: trabajador.documentoIdentidad,
            trabajadorEmail: trabajador.emailPersonal,
            resultadoExamenId: null,
          });
          const saved = await this.certificadoRepository.save(certificado);
          if (this.storageService.isAvailable()) {
            try {
              const pdfBuffer = await this.certificadoPdfService.generateCertificadoPdf(
                capacitacion,
                trabajador,
                nota,
                capacitacion.firmaCapacitadorUrl,
                capacitacion.instructorNombre,
                capacitacion.responsableRegistroNombre,
                capacitacion.responsableRegistroFirmaUrl,
              );
              const empresa = capacitacion.empresa as any;
              const ruc = empresa?.ruc ?? 'sistema';
              const pdfUrl = await this.storageService.uploadFile(ruc, pdfBuffer, 'certificado_capacitacion', {
                filename: `cert-${saved.id}.pdf`,
                contentType: 'application/pdf',
              });
              saved.pdfUrl = pdfUrl;
              await this.certificadoRepository.save(saved);
            } catch (err) {
              console.error('Error generando PDF de certificado:', err);
            }
          }
        }
      }
    }
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

  /**
   * Cumplimiento anual por trabajador (año calendario).
   * Regla: cada trabajador debe tener al menos 4 capacitaciones anuales completadas.
   * Cuenta Asistencia donde asistencia=true y capacitacion.estado in (COMPLETADA, Cancelada).
   */
  async getCumplimientoAnualTrabajadores(
    empresaId: string,
    anio: number,
    filtros?: { unidad?: string; area?: string; sede?: string; gerencia?: string },
  ): Promise<{
    total_trabajadores_activos: number;
    trabajadores: Array<{
      trabajador_id: string;
      nombre: string;
      documento: string;
      area: string | null;
      cantidad_certificados: number;
      capacitaciones: Array<{ titulo: string; fecha: string; tipo: string }>;
    }>;
  }> {
    const inicioAnio = new Date(anio, 0, 1);
    const finAnio = new Date(anio, 11, 31);

    const qb = this.trabajadorRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.area', 'area')
      .where('t.empresa_id = :empresaId', { empresaId })
      .andWhere('t.estado = :estado', { estado: EstadoTrabajador.Activo });
    if (filtros?.unidad) qb.andWhere('t.unidad = :unidad', { unidad: filtros.unidad });
    if (filtros?.sede) qb.andWhere('t.sede = :sede', { sede: filtros.sede });
    if (filtros?.gerencia) qb.andWhere('t.gerencia = :gerencia', { gerencia: filtros.gerencia });
    if (filtros?.area) qb.andWhere('area.nombre = :areaNombre', { areaNombre: filtros.area });
    const trabajadoresActivos = await qb.getMany();

    const asistencias = await this.asistenciaRepository
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.capacitacion', 'cap')
      .where('cap.empresaId = :empresaId', { empresaId })
      .andWhere('a.asistencia = :asistencia', { asistencia: true })
      .andWhere('cap.fecha >= :inicio', { inicio: inicioAnio })
      .andWhere('cap.fecha <= :fin', { fin: finAnio })
      .andWhere('cap.estado IN (:...estados)', {
        estados: [EstadoCapacitacion.Completada, EstadoCapacitacion.Cancelada],
      })
      .getMany();

    const porTrabajador: Record<
      string,
      { nombre: string; documento: string; area: string | null; capacitaciones: Array<{ titulo: string; fecha: string; tipo: string }> }
    > = {};

    trabajadoresActivos.forEach((t) => {
      porTrabajador[t.id] = {
        nombre: t.nombreCompleto,
        documento: t.documentoIdentidad,
        area: (t.area as any)?.nombre ?? null,
        capacitaciones: [],
      };
    });

    const idsActivos = new Set(trabajadoresActivos.map((t) => t.id));
    const seenCapPorTrabajador: Record<string, Set<string>> = {};
    asistencias.forEach((a) => {
      const cap = a.capacitacion;
      const tid = a.trabajadorId;
      if (!idsActivos.has(tid)) return;
      if (!seenCapPorTrabajador[tid]) seenCapPorTrabajador[tid] = new Set();
      if (seenCapPorTrabajador[tid].has(cap.id)) return;
      seenCapPorTrabajador[tid].add(cap.id);

      const fechaCap = cap.fecha instanceof Date ? cap.fecha : new Date(cap.fecha);
      porTrabajador[tid].capacitaciones.push({
        titulo: cap.titulo,
        fecha: fechaCap.toISOString().split('T')[0],
        tipo: cap.tipo ?? 'Capacitación',
      });
    });

    const trabajadores = trabajadoresActivos.map((t) => ({
      trabajador_id: t.id,
      nombre: porTrabajador[t.id]?.nombre ?? t.nombreCompleto,
      documento: porTrabajador[t.id]?.documento ?? t.documentoIdentidad,
      area: porTrabajador[t.id]?.area ?? (t.area as any)?.nombre ?? null,
      cantidad_certificados: porTrabajador[t.id]?.capacitaciones?.length ?? 0,
      capacitaciones: porTrabajador[t.id]?.capacitaciones ?? [],
    }));

    return {
      total_trabajadores_activos: trabajadoresActivos.length,
      trabajadores,
    };
  }
}
