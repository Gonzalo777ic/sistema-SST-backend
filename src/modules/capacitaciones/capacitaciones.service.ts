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
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { ResponseCapacitacionDto } from './dto/response-capacitacion.dto';
import { CreateExamenCapacitacionDto } from './dto/create-examen-capacitacion.dto';
import { CreateResultadoExamenDto } from './dto/create-resultado-examen.dto';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';

@Injectable()
export class CapacitacionesService {
  constructor(
    @InjectRepository(Capacitacion)
    private readonly capacitacionRepository: Repository<Capacitacion>,
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
  ) {}

  async create(dto: CreateCapacitacionDto): Promise<ResponseCapacitacionDto> {
    // Validar hora_fin > hora_inicio
    if (dto.hora_fin <= dto.hora_inicio) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }

    const capacitacion = this.capacitacionRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      lugar: dto.lugar,
      tipo: dto.tipo,
      fecha: new Date(dto.fecha),
      horaInicio: dto.hora_inicio,
      horaFin: dto.hora_fin,
      duracionHoras: dto.duracion_horas,
      instructorId: dto.instructor_id ?? null,
      instructorNombre: dto.instructor ?? null,
      materialUrl: dto.material_url ?? null,
      certificadoUrl: dto.certificado_url ?? null,
      estado: dto.estado ?? EstadoCapacitacion.Programada,
      empresaId: dto.empresa_id,
      creadoPorId: dto.creado_por_id,
    });

    const saved = await this.capacitacionRepository.save(capacitacion);

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
          });
        }),
      );
      await this.asistenciaRepository.save(asistencias);
    }

    return this.findOne(saved.id);
  }

  async findAll(empresaId?: string): Promise<ResponseCapacitacionDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const capacitaciones = await this.capacitacionRepository.find({
      where,
      relations: ['asistencias', 'creadoPor', 'examenes'],
      order: { fecha: 'DESC' },
    });

    return capacitaciones.map((c) => ResponseCapacitacionDto.fromEntity(c));
  }

  async findOne(id: string): Promise<ResponseCapacitacionDto> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id },
      relations: ['asistencias', 'creadoPor', 'examenes'],
    });

    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${id} no encontrada`);
    }

    return ResponseCapacitacionDto.fromEntity(capacitacion);
  }

  async update(
    id: string,
    dto: UpdateCapacitacionDto,
  ): Promise<ResponseCapacitacionDto> {
    const capacitacion = await this.capacitacionRepository.findOne({
      where: { id },
      relations: ['asistencias'],
    });

    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${id} no encontrada`);
    }

    if (capacitacion.estado === EstadoCapacitacion.Cancelada && dto.participantes) {
      throw new BadRequestException(
        'No se pueden agregar participantes a una capacitación cancelada',
      );
    }

    // Actualizar campos
    Object.assign(capacitacion, {
      titulo: dto.titulo ?? capacitacion.titulo,
      descripcion: dto.descripcion ?? capacitacion.descripcion,
      lugar: dto.lugar ?? capacitacion.lugar,
      tipo: dto.tipo ?? capacitacion.tipo,
      fecha: dto.fecha ? new Date(dto.fecha) : capacitacion.fecha,
      horaInicio: dto.hora_inicio ?? capacitacion.horaInicio,
      horaFin: dto.hora_fin ?? capacitacion.horaFin,
      duracionHoras: dto.duracion_horas ?? capacitacion.duracionHoras,
      instructorId: dto.instructor_id ?? capacitacion.instructorId,
      instructorNombre: dto.instructor ?? capacitacion.instructorNombre,
      materialUrl: dto.material_url ?? capacitacion.materialUrl,
      certificadoUrl: dto.certificado_url ?? capacitacion.certificadoUrl,
      estado: dto.estado ?? capacitacion.estado,
    });

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
        const certificado = this.certificadoRepository.create({
          numeroCertificado,
          capacitacionId: capacitacion.id,
          capacitacionTitulo: capacitacion.titulo,
          fechaCapacitacion: capacitacion.fecha,
          duracionHoras: capacitacion.duracionHoras,
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
      asistenciaRecord.aprobado = calificacion >= 70; // Umbral por defecto
    }

    await this.asistenciaRepository.save(asistenciaRecord);
  }

  async obtenerExamenesPorCapacitacion(
    capacitacionId: string,
  ): Promise<ExamenCapacitacion[]> {
    return this.examenRepository.find({
      where: { capacitacionId, activo: true },
      relations: ['resultados'],
    });
  }
}
