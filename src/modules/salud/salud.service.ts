import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { ExamenMedico, ResultadoExamen, EstadoExamen } from './entities/examen-medico.entity';
import { CitaMedica, EstadoCita } from './entities/cita-medica.entity';
import { ComentarioMedico } from './entities/comentario-medico.entity';
import { HorarioDoctor } from './entities/horario-doctor.entity';
import { CreateExamenMedicoDto } from './dto/create-examen-medico.dto';
import { UpdateExamenMedicoDto } from './dto/update-examen-medico.dto';
import { ResponseExamenMedicoDto } from './dto/response-examen-medico.dto';
import { CreateCitaMedicaDto } from './dto/create-cita-medica.dto';
import { UpdateCitaMedicaDto } from './dto/update-cita-medica.dto';
import { ResponseCitaMedicaDto } from './dto/response-cita-medica.dto';
import { CreateComentarioMedicoDto } from './dto/create-comentario-medico.dto';
import { UpdateComentarioMedicoDto } from './dto/update-comentario-medico.dto';
import { ResponseComentarioMedicoDto } from './dto/response-comentario-medico.dto';
import { CreateHorarioDoctorDto } from './dto/create-horario-doctor.dto';
import { UpdateHorarioDoctorDto } from './dto/update-horario-doctor.dto';
import { ResponseHorarioDoctorDto } from './dto/response-horario-doctor.dto';
import { CreateSeguimientoMedicoDto } from './dto/create-seguimiento-medico.dto';
import { UpdateSeguimientoMedicoDto } from './dto/update-seguimiento-medico.dto';
import { Usuario, UsuarioRol } from '../usuarios/entities/usuario.entity';
import { UsuarioCentroMedico } from '../usuario-centro-medico/entities/usuario-centro-medico.entity';
import { EstadoParticipacion } from '../usuario-centro-medico/entities/usuario-centro-medico.entity';
import { CentroMedico } from '../config-emo/entities/centro-medico.entity';
import { DocumentoExamenMedico } from './entities/documento-examen-medico.entity';
import {
  SeguimientoMedico,
  EstadoSeguimiento,
} from './entities/seguimiento-medico.entity';
import { PruebaMedica } from './entities/prueba-medica.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { StorageService } from '../../common/services/storage.service';

@Injectable()
export class SaludService {
  constructor(
    @InjectRepository(ExamenMedico)
    private readonly examenRepository: Repository<ExamenMedico>,
    @InjectRepository(DocumentoExamenMedico)
    private readonly documentoExamenRepo: Repository<DocumentoExamenMedico>,
    @InjectRepository(SeguimientoMedico)
    private readonly seguimientoRepository: Repository<SeguimientoMedico>,
    @InjectRepository(PruebaMedica)
    private readonly pruebaMedicaRepository: Repository<PruebaMedica>,
    @InjectRepository(CitaMedica)
    private readonly citaRepository: Repository<CitaMedica>,
    @InjectRepository(ComentarioMedico)
    private readonly comentarioRepository: Repository<ComentarioMedico>,
    @InjectRepository(HorarioDoctor)
    private readonly horarioRepository: Repository<HorarioDoctor>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioCentroMedico)
    private readonly usuarioCentroMedicoRepository: Repository<UsuarioCentroMedico>,
    @InjectRepository(CentroMedico)
    private readonly centroMedicoRepository: Repository<CentroMedico>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    private readonly storageService: StorageService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private isProfesionalSalud(roles: string[]): boolean {
    return roles?.some(
      (r) => r === UsuarioRol.MEDICO || r === UsuarioRol.CENTRO_MEDICO,
    ) ?? false;
  }

  /** Roles que pueden ver documentos de exámenes médicos (centro médico, médico, admins) */
  private puedeVerDocumentosExamen(roles: string[]): boolean {
    return roles?.some(
      (r) =>
        r === UsuarioRol.CENTRO_MEDICO ||
        r === UsuarioRol.MEDICO ||
        r === UsuarioRol.SUPER_ADMIN ||
        r === UsuarioRol.ADMIN_EMPRESA ||
        r === UsuarioRol.INGENIERO_SST,
    ) ?? false;
  }

  // ========== EXÁMENES MÉDICOS ==========
  async createExamen(
    dto: CreateExamenMedicoDto,
    user?: { id: string; roles: string[] },
  ): Promise<ResponseExamenMedicoDto> {
    // Validar restricciones si es "Apto con Restricciones"
    if (dto.resultado === ResultadoExamen.AptoConRestricciones && !dto.restricciones) {
      throw new BadRequestException(
        'El campo restricciones es obligatorio cuando el resultado es "Apto con Restricciones"',
      );
    }

    const examen = this.examenRepository.create({
      trabajadorId: dto.trabajador_id,
      tipoExamen: dto.tipo_examen,
      fechaProgramada: new Date(dto.fecha_programada),
      fechaRealizado: dto.fecha_realizado ? new Date(dto.fecha_realizado) : null,
      fechaVencimiento: dto.fecha_vencimiento ? new Date(dto.fecha_vencimiento) : null,
      centroMedico: dto.centro_medico,
      medicoEvaluador: dto.medico_evaluador ?? null,
      horaProgramacion: dto.hora_programacion ?? null,
      perfilEmoId: dto.perfil_emo_id ?? null,
      proyecto: dto.proyecto ?? null,
      adicionales: dto.adicionales ?? null,
      recomendacionesPersonalizadas: dto.recomendaciones_personalizadas ?? null,
      resultado: dto.resultado ?? ResultadoExamen.Pendiente,
      restricciones: dto.restricciones ?? null,
      observaciones: dto.observaciones ?? null,
      resultadoArchivoUrl: dto.resultado_archivo_url ?? null,
      estado: dto.estado ?? EstadoExamen.Programado,
      cargadoPorId: dto.cargado_por_id,
    });

    const saved = await this.examenRepository.save(examen);

    // Alertar si es No Apto
    if (saved.resultado === ResultadoExamen.NoApto) {
      console.log(`⚠️ ALERTA CRÍTICA: Examen No Apto - Trabajador: ${dto.trabajador_id}`);
    }

    return this.findOneExamen(saved.id, user);
  }

  async findAllExamenes(
    trabajadorId?: string,
    centroMedicoId?: string,
  ): Promise<ResponseExamenMedicoDto[]> {
    const where: any = {};
    if (trabajadorId) {
      where.trabajadorId = trabajadorId;
    }
    if (centroMedicoId) {
      const centro = await this.centroMedicoRepository.findOne({
        where: { id: centroMedicoId },
        select: ['nombre'],
      });
      if (centro) {
        where.centroMedico = centro.nombre;
      }
    }

    const examenes = await this.examenRepository.find({
      where,
      relations: ['trabajador', 'cargadoPor'],
      order: { fechaProgramada: 'DESC' },
    });

    return examenes.map((e) => ResponseExamenMedicoDto.fromEntity(e));
  }

  async findOneExamen(
    id: string,
    user?: { id: string; roles: string[] },
  ): Promise<ResponseExamenMedicoDto> {
    const examen = await this.examenRepository.findOne({
      where: { id },
      relations: ['trabajador', 'trabajador.empresa', 'cargadoPor'],
    });

    if (!examen) {
      throw new NotFoundException(`Examen médico con ID ${id} no encontrado`);
    }

    const dto = ResponseExamenMedicoDto.fromEntity(examen);
    const esProfesionalSalud = user && this.isProfesionalSalud(user.roles);

    if (!esProfesionalSalud) {
      dto.resultado_archivo_url = null;
      dto.resultado_archivo_existe = !!examen.resultadoArchivoUrl;
      dto.restricciones = null;
      dto.observaciones = null;
      dto.diagnosticos_cie10 = null;
      dto.programas_vigilancia = null;
    }

    // Incluir documentos y seguimientos en la respuesta para centro médico/médico
    if (esProfesionalSalud) {
      dto.documentos = await this.findDocumentosExamen(id);
      dto.seguimientos = await this.findSeguimientosExamen(id);
    }

    return dto;
  }

  async updateExamen(
    id: string,
    dto: UpdateExamenMedicoDto,
    user?: { id: string; roles: string[] },
  ): Promise<ResponseExamenMedicoDto> {
    const examen = await this.examenRepository.findOne({ where: { id } });

    if (!examen) {
      throw new NotFoundException(`Examen médico con ID ${id} no encontrado`);
    }

    const esProfesionalSalud = user && this.isProfesionalSalud(user.roles);
    if (!esProfesionalSalud) {
      const camposRestringidos = [
        'resultado',
        'restricciones',
        'observaciones',
        'diagnosticos_cie10',
        'programas_vigilancia',
        'fecha_realizado',
        'fecha_vencimiento',
        'resultado_archivo_url',
      ];
      const intentaModificar = camposRestringidos.some(
        (c) => (dto as any)[c] !== undefined,
      );
      if (intentaModificar) {
        throw new ForbiddenException(
          'Solo el profesional de salud (Médico Ocupacional / Centro Médico) puede registrar o modificar diagnósticos, aptitud, restricciones y conclusiones clínicas.',
        );
      }
    }

    // Validar restricciones si cambia a "Apto con Restricciones"
    if (
      (dto.resultado === ResultadoExamen.AptoConRestricciones ||
        (dto.resultado === undefined &&
          examen.resultado === ResultadoExamen.AptoConRestricciones)) &&
      !dto.restricciones &&
      !examen.restricciones
    ) {
      throw new BadRequestException(
        'El campo restricciones es obligatorio cuando el resultado es "Apto con Restricciones"',
      );
    }

    if (dto.tipo_examen !== undefined) examen.tipoExamen = dto.tipo_examen;
    if (dto.fecha_programada !== undefined)
      examen.fechaProgramada = new Date(dto.fecha_programada);
    if (dto.fecha_realizado !== undefined)
      examen.fechaRealizado = dto.fecha_realizado ? new Date(dto.fecha_realizado) : null;
    if (dto.fecha_vencimiento !== undefined)
      examen.fechaVencimiento = dto.fecha_vencimiento
        ? new Date(dto.fecha_vencimiento)
        : null;
    if (dto.centro_medico !== undefined) examen.centroMedico = dto.centro_medico;
    if (dto.medico_evaluador !== undefined)
      examen.medicoEvaluador = dto.medico_evaluador;
    if (dto.hora_programacion !== undefined)
      examen.horaProgramacion = dto.hora_programacion ?? null;
    if (dto.perfil_emo_id !== undefined)
      examen.perfilEmoId = dto.perfil_emo_id ?? null;
    if (dto.proyecto !== undefined) examen.proyecto = dto.proyecto ?? null;
    if (dto.adicionales !== undefined) examen.adicionales = dto.adicionales ?? null;
    if (dto.recomendaciones_personalizadas !== undefined)
      examen.recomendacionesPersonalizadas = dto.recomendaciones_personalizadas ?? null;
    if (dto.resultado !== undefined) examen.resultado = dto.resultado;
    if (dto.restricciones !== undefined) examen.restricciones = dto.restricciones;
    if (dto.observaciones !== undefined) examen.observaciones = dto.observaciones;
    if (dto.diagnosticos_cie10 !== undefined)
      examen.diagnosticosCie10 = dto.diagnosticos_cie10;
    if (dto.programas_vigilancia !== undefined)
      examen.programasVigilancia = dto.programas_vigilancia;
    if (dto.resultado_archivo_url !== undefined)
      examen.resultadoArchivoUrl = dto.resultado_archivo_url;
    if (dto.estado !== undefined) examen.estado = dto.estado;

    // Cuando el médico ocupacional guarda la aptitud (Apto/No Apto), estado → COMPLETADO
    const estadoActual = dto.estado ?? examen.estado;
    if (
      esProfesionalSalud &&
      user?.id &&
      dto.resultado !== undefined &&
      dto.resultado !== ResultadoExamen.Pendiente &&
      estadoActual !== EstadoExamen.Completado &&
      estadoActual !== EstadoExamen.Entregado
    ) {
      examen.estado = EstadoExamen.Completado;
      examen.revisadoPorDoctor = true;
      examen.fechaRevisionDoctor = new Date();
      examen.doctorInternoId = user.id;
    }

    await this.examenRepository.save(examen);

    if (examen.resultado === ResultadoExamen.NoApto) {
      console.log(`⚠️ ALERTA CRÍTICA: Examen actualizado a No Apto - ID: ${id}`);
    }

    return this.findOneExamen(id, user);
  }

  async removeExamen(id: string): Promise<void> {
    const examen = await this.examenRepository.findOne({ where: { id } });

    if (!examen) {
      throw new NotFoundException(`Examen médico con ID ${id} no encontrado`);
    }

    // No permitir eliminar exámenes médicos (historial legal)
    throw new BadRequestException(
      'No se pueden eliminar exámenes médicos por razones de auditoría legal',
    );
  }

  // ========== CITAS MÉDICAS ==========
  async createCita(dto: CreateCitaMedicaDto): Promise<ResponseCitaMedicaDto> {
    const fechaCita = new Date(dto.fecha_cita);

    // Validar que la fecha no sea en el pasado
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaCita.setHours(0, 0, 0, 0);

    if (fechaCita < hoy) {
      throw new BadRequestException(
        'No se pueden programar citas en el pasado',
      );
    }

    // Validar disponibilidad del doctor
    if (dto.doctor_id) {
      const citaExistente = await this.citaRepository.findOne({
        where: {
          doctorId: dto.doctor_id,
          fechaCita: fechaCita,
          horaCita: dto.hora_cita,
          estado: EstadoCita.Programada,
        },
      });

      if (citaExistente) {
        throw new ConflictException(
          'Ya existe una cita programada para este doctor en esta fecha y hora',
        );
      }
    }

    const cita = this.citaRepository.create({
      motivo: dto.motivo,
      fechaCita: fechaCita,
      horaCita: dto.hora_cita,
      duracionMinutos: dto.duracion_minutos ?? 30,
      notasCita: dto.notas_cita ?? null,
      doctorNombre: dto.doctor_nombre ?? null,
      trabajadorId: dto.trabajador_id,
      doctorId: dto.doctor_id ?? null,
      examenRelacionadoId: dto.examen_relacionado_id ?? null,
      estado: dto.estado ?? EstadoCita.Programada,
    });

    const saved = await this.citaRepository.save(cita);
    return this.findOneCita(saved.id);
  }

  async findAllCitas(
    trabajadorId?: string,
    doctorId?: string,
    centroMedicoId?: string,
  ): Promise<ResponseCitaMedicaDto[]> {
    const where: any = {};
    if (trabajadorId) {
      where.trabajadorId = trabajadorId;
    }
    if (doctorId) {
      where.doctorId = doctorId;
    }

    // Filtrar por centro médico: citas donde el doctor pertenece al centro (vía UsuarioCentroMedico)
    if (centroMedicoId) {
      const participaciones = await this.usuarioCentroMedicoRepository.find({
        where: {
          centroMedicoId,
          estado: EstadoParticipacion.ACTIVO,
        },
        select: ['usuarioId'],
      });
      const doctorIds = [...new Set(participaciones.map((p) => p.usuarioId))];
      if (doctorIds.length === 0) {
        return [];
      }
      where.doctorId = In(doctorIds);
    }

    const citas = await this.citaRepository.find({
      where,
      relations: ['trabajador'],
      order: { fechaCita: 'ASC', horaCita: 'ASC' },
    });

    return citas.map((c) => ResponseCitaMedicaDto.fromEntity(c));
  }

  async findOneCita(id: string): Promise<ResponseCitaMedicaDto> {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: ['trabajador'],
    });

    if (!cita) {
      throw new NotFoundException(`Cita médica con ID ${id} no encontrada`);
    }

    return ResponseCitaMedicaDto.fromEntity(cita);
  }

  async updateCita(
    id: string,
    dto: UpdateCitaMedicaDto,
  ): Promise<ResponseCitaMedicaDto> {
    const cita = await this.citaRepository.findOne({ where: { id } });

    if (!cita) {
      throw new NotFoundException(`Cita médica con ID ${id} no encontrada`);
    }

    if (dto.fecha_cita) {
      const fechaCita = new Date(dto.fecha_cita);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaCita.setHours(0, 0, 0, 0);

      if (fechaCita < hoy && cita.estado === EstadoCita.Programada) {
        throw new BadRequestException(
          'No se pueden programar citas en el pasado',
        );
      }
    }

    if (dto.motivo !== undefined) cita.motivo = dto.motivo;
    if (dto.fecha_cita !== undefined) cita.fechaCita = new Date(dto.fecha_cita);
    if (dto.hora_cita !== undefined) cita.horaCita = dto.hora_cita;
    if (dto.duracion_minutos !== undefined)
      cita.duracionMinutos = dto.duracion_minutos;
    if (dto.notas_cita !== undefined) cita.notasCita = dto.notas_cita;
    if (dto.doctor_nombre !== undefined) cita.doctorNombre = dto.doctor_nombre;
    if (dto.doctor_id !== undefined) cita.doctorId = dto.doctor_id;
    if (dto.examen_relacionado_id !== undefined)
      cita.examenRelacionadoId = dto.examen_relacionado_id;

    // Manejar cambio de estado a Confirmada
    if (dto.estado === EstadoCita.Confirmada && cita.estado !== EstadoCita.Confirmada) {
      cita.fechaConfirmacion = new Date();
      cita.estado = EstadoCita.Confirmada;
    } else if (dto.estado !== undefined) {
      cita.estado = dto.estado;
    }

    await this.citaRepository.save(cita);
    return this.findOneCita(id);
  }

  async removeCita(id: string): Promise<void> {
    const cita = await this.citaRepository.findOne({ where: { id } });

    if (!cita) {
      throw new NotFoundException(`Cita médica con ID ${id} no encontrada`);
    }

    await this.citaRepository.remove(cita);
  }

  // ========== COMENTARIOS MÉDICOS ==========
  async createComentario(
    dto: CreateComentarioMedicoDto,
  ): Promise<ResponseComentarioMedicoDto> {
    // Verificar que el examen existe
    const examen = await this.examenRepository.findOne({
      where: { id: dto.examen_id },
    });

    if (!examen) {
      throw new NotFoundException(
        `Examen médico con ID ${dto.examen_id} no encontrado`,
      );
    }

    const comentario = this.comentarioRepository.create({
      examenId: dto.examen_id,
      trabajadorId: dto.trabajador_id,
      doctorId: dto.doctor_id,
      doctorNombre: dto.doctor_nombre,
      comentario: dto.comentario,
      recomendaciones: dto.recomendaciones ?? null,
      esConfidencial: dto.es_confidencial ?? true,
      fechaComentario: new Date(),
    });

    const saved = await this.comentarioRepository.save(comentario);
    return this.findOneComentario(saved.id);
  }

  async findAllComentarios(
    examenId?: string,
    trabajadorId?: string,
  ): Promise<ResponseComentarioMedicoDto[]> {
    const where: any = {};
    if (examenId) {
      where.examenId = examenId;
    }
    if (trabajadorId) {
      where.trabajadorId = trabajadorId;
    }

    const comentarios = await this.comentarioRepository.find({
      where,
      order: { fechaComentario: 'DESC' },
    });

    return comentarios.map((c) => ResponseComentarioMedicoDto.fromEntity(c));
  }

  async findOneComentario(id: string): Promise<ResponseComentarioMedicoDto> {
    const comentario = await this.comentarioRepository.findOne({
      where: { id },
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario médico con ID ${id} no encontrado`);
    }

    // Marcar como leído si no lo está
    if (!comentario.leidoPorPaciente) {
      comentario.leidoPorPaciente = true;
      comentario.fechaLectura = new Date();
      await this.comentarioRepository.save(comentario);
    }

    return ResponseComentarioMedicoDto.fromEntity(comentario);
  }

  async updateComentario(
    id: string,
    dto: UpdateComentarioMedicoDto,
  ): Promise<ResponseComentarioMedicoDto> {
    const comentario = await this.comentarioRepository.findOne({ where: { id } });

    if (!comentario) {
      throw new NotFoundException(`Comentario médico con ID ${id} no encontrado`);
    }

    // Validar inmutabilidad si ya fue leído
    if (comentario.leidoPorPaciente) {
      throw new BadRequestException(
        'No se puede editar un comentario que ya ha sido leído por el paciente',
      );
    }

    if (dto.comentario !== undefined) comentario.comentario = dto.comentario;
    if (dto.recomendaciones !== undefined)
      comentario.recomendaciones = dto.recomendaciones;
    if (dto.es_confidencial !== undefined)
      comentario.esConfidencial = dto.es_confidencial;

    await this.comentarioRepository.save(comentario);
    return this.findOneComentario(id);
  }

  async removeComentario(id: string): Promise<void> {
    // No permitir eliminar comentarios médicos (auditoría)
    throw new BadRequestException(
      'No se pueden eliminar comentarios médicos por razones de auditoría',
    );
  }

  // ========== HORARIOS DOCTOR ==========
  async createHorario(dto: CreateHorarioDoctorDto): Promise<ResponseHorarioDoctorDto> {
    // Validar hora_fin > hora_inicio
    if (dto.hora_fin <= dto.hora_inicio) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }

    // Validar que la duración sea múltiplo de duracion_cita_minutos
    const inicioMinutos = this.horaAMinutos(dto.hora_inicio);
    const finMinutos = this.horaAMinutos(dto.hora_fin);
    const duracionTotal = finMinutos - inicioMinutos;
    const duracionCita = dto.duracion_cita_minutos ?? 30;

    if (duracionTotal < duracionCita) {
      throw new BadRequestException(
        'La duración del horario debe ser mayor o igual a la duración de la cita',
      );
    }

    // Validar solapamiento
    await this.validarSolapamiento(
      dto.doctor_id,
      dto.dia_semana,
      dto.hora_inicio,
      dto.hora_fin,
    );

    const horario = this.horarioRepository.create({
      diaSemana: dto.dia_semana,
      horaInicio: dto.hora_inicio,
      horaFin: dto.hora_fin,
      duracionCitaMinutos: duracionCita,
      activo: dto.activo ?? true,
      doctorId: dto.doctor_id,
      empresaId: dto.empresa_id,
    });

    const saved = await this.horarioRepository.save(horario);
    return this.findOneHorario(saved.id);
  }

  async findAllHorarios(doctorId?: string, empresaId?: string): Promise<ResponseHorarioDoctorDto[]> {
    const where: any = {};
    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const horarios = await this.horarioRepository.find({
      where,
      relations: ['doctor'],
      order: {
        diaSemana: 'ASC',
        horaInicio: 'ASC',
      },
    });

    return horarios.map((h) => ResponseHorarioDoctorDto.fromEntity(h));
  }

  async findOneHorario(id: string): Promise<ResponseHorarioDoctorDto> {
    const horario = await this.horarioRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }

    return ResponseHorarioDoctorDto.fromEntity(horario);
  }

  async updateHorario(
    id: string,
    dto: UpdateHorarioDoctorDto,
  ): Promise<ResponseHorarioDoctorDto> {
    const horario = await this.horarioRepository.findOne({ where: { id } });

    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }

    // Validar solapamiento si cambian día u horas
    if (
      (dto.dia_semana || dto.hora_inicio || dto.hora_fin) &&
      (dto.dia_semana !== horario.diaSemana ||
        dto.hora_inicio !== horario.horaInicio ||
        dto.hora_fin !== horario.horaFin)
    ) {
      const dia = dto.dia_semana ?? horario.diaSemana;
      const inicio = dto.hora_inicio ?? horario.horaInicio;
      const fin = dto.hora_fin ?? horario.horaFin;

      await this.validarSolapamiento(horario.doctorId, dia, inicio, fin, id);
    }

    // Validar hora_fin > hora_inicio
    const horaInicio = dto.hora_inicio ?? horario.horaInicio;
    const horaFin = dto.hora_fin ?? horario.horaFin;

    if (horaFin <= horaInicio) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }

    // Actualizar campos
    Object.assign(horario, {
      diaSemana: dto.dia_semana ?? horario.diaSemana,
      horaInicio: dto.hora_inicio ?? horario.horaInicio,
      horaFin: dto.hora_fin ?? horario.horaFin,
      duracionCitaMinutos: dto.duracion_cita_minutos ?? horario.duracionCitaMinutos,
      activo: dto.activo ?? horario.activo,
    });

    await this.horarioRepository.save(horario);
    return this.findOneHorario(id);
  }

  async removeHorario(id: string): Promise<void> {
    const horario = await this.horarioRepository.findOne({ where: { id } });

    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }

    // Verificar si hay citas futuras
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const citasFuturas = await this.citaRepository
      .createQueryBuilder('cita')
      .where('cita.doctorId = :doctorId', { doctorId: horario.doctorId })
      .andWhere('cita.fechaCita >= :hoy', { hoy })
      .andWhere('cita.estado = :estado', { estado: EstadoCita.Programada })
      .getCount();

    if (citasFuturas > 0) {
      // En lugar de eliminar, desactivar
      horario.activo = false;
      await this.horarioRepository.save(horario);
    } else {
      await this.horarioRepository.remove(horario);
    }
  }

  private horaAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  private async validarSolapamiento(
    doctorId: string,
    diaSemana: string,
    horaInicio: string,
    horaFin: string,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.horarioRepository
      .createQueryBuilder('horario')
      .where('horario.doctorId = :doctorId', { doctorId })
      .andWhere('horario.diaSemana = :diaSemana', { diaSemana })
      .andWhere('horario.activo = :activo', { activo: true });

    if (excludeId) {
      queryBuilder.andWhere('horario.id != :excludeId', { excludeId });
    }

    const horariosExistentes = await queryBuilder.getMany();

    const inicioMinutos = this.horaAMinutos(horaInicio);
    const finMinutos = this.horaAMinutos(horaFin);

    for (const horario of horariosExistentes) {
      const inicioExistente = this.horaAMinutos(horario.horaInicio);
      const finExistente = this.horaAMinutos(horario.horaFin);

      // Verificar solapamiento
      if (
        (inicioMinutos >= inicioExistente && inicioMinutos < finExistente) ||
        (finMinutos > inicioExistente && finMinutos <= finExistente) ||
        (inicioMinutos <= inicioExistente && finMinutos >= finExistente)
      ) {
        throw new ConflictException(
          `El horario se solapa con otro horario existente: ${horario.horaInicio} - ${horario.horaFin}`,
        );
      }
    }
  }

  // ========== PRUEBAS MÉDICAS (Maestro dinámico) ==========
  async findAllPruebasMedicas(): Promise<Array<{ id: string; nombre: string }>> {
    const pruebas = await this.pruebaMedicaRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
      select: ['id', 'nombre'],
    });
    return pruebas.map((p) => ({ id: p.id, nombre: p.nombre }));
  }

  async findAllPruebasMedicasAdmin(incluirInactivos = false): Promise<Array<{ id: string; nombre: string; activo: boolean }>> {
    const where = incluirInactivos ? {} : { activo: true };
    const pruebas = await this.pruebaMedicaRepository.find({
      where,
      order: { nombre: 'ASC' },
      select: ['id', 'nombre', 'activo'],
    });
    return pruebas.map((p) => ({ id: p.id, nombre: p.nombre, activo: p.activo }));
  }

  async createPruebaMedica(nombre: string): Promise<{ id: string; nombre: string; activo: boolean }> {
    const existente = await this.pruebaMedicaRepository.findOne({
      where: { nombre: nombre.trim() },
    });
    if (existente) {
      throw new ConflictException(`Ya existe una prueba médica con el nombre "${nombre.trim()}"`);
    }
    const prueba = this.pruebaMedicaRepository.create({
      nombre: nombre.trim(),
      activo: true,
    });
    const saved = await this.pruebaMedicaRepository.save(prueba);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo };
  }

  async updatePruebaMedica(
    id: string,
    dto: { nombre?: string; activo?: boolean },
  ): Promise<{ id: string; nombre: string; activo: boolean }> {
    const prueba = await this.pruebaMedicaRepository.findOne({ where: { id } });
    if (!prueba) throw new NotFoundException('Prueba médica no encontrada');
    if (dto.nombre !== undefined) prueba.nombre = dto.nombre.trim();
    if (dto.activo !== undefined) prueba.activo = dto.activo;
    const saved = await this.pruebaMedicaRepository.save(prueba);
    return { id: saved.id, nombre: saved.nombre, activo: saved.activo };
  }

  // ========== DOCUMENTOS EXAMEN (Centro Médico - Etiquetado por PruebaMedica) ==========
  async findDocumentosExamen(examenId: string): Promise<
    Array<{ id: string; tipo_etiqueta: string; prueba_medica?: { id: string; nombre: string }; nombre_archivo: string; url: string; created_at: string }>
  > {
    const docs = await this.documentoExamenRepo.find({
      where: { examenId },
      relations: ['pruebaMedica'],
      order: { createdAt: 'DESC' },
    });
    return docs.map((d) => ({
      id: d.id,
      tipo_etiqueta: d.tipoEtiqueta ?? (d.pruebaMedica?.nombre ?? 'Sin clasificar'),
      prueba_medica: d.pruebaMedica ? { id: d.pruebaMedica.id, nombre: d.pruebaMedica.nombre } : undefined,
      nombre_archivo: d.nombreArchivo,
      url: d.url,
      created_at: d.createdAt.toISOString(),
    }));
  }

  // ========== SEGUIMIENTOS MÉDICOS (Interconsultas y Vigilancia) ==========
  async findSeguimientosExamen(examenId: string): Promise<
    Array<{
      id: string;
      tipo: string;
      cie10_code: string;
      cie10_description: string | null;
      especialidad: string;
      estado: string;
      plazo: string;
      motivo: string | null;
    }>
  > {
    const items = await this.seguimientoRepository.find({
      where: { examenMedicoId: examenId },
      order: { createdAt: 'DESC' },
    });
    return items.map((s) => ({
      id: s.id,
      tipo: s.tipo,
      cie10_code: s.cie10Code,
      cie10_description: s.cie10Description,
      especialidad: s.especialidad,
      estado: s.estado,
      plazo: s.plazo
        ? (s.plazo instanceof Date ? s.plazo.toISOString() : String(s.plazo)).split('T')[0]
        : '',
      motivo: s.motivo,
    }));
  }

  async createSeguimiento(
    examenId: string,
    dto: CreateSeguimientoMedicoDto,
    user?: { id: string; roles: string[] },
  ) {
    const examen = await this.examenRepository.findOne({ where: { id: examenId } });
    if (!examen) throw new NotFoundException('Examen no encontrado');
    if (!user || !this.isProfesionalSalud(user.roles)) {
      throw new ForbiddenException(
        'Solo el profesional de salud puede agregar interconsultas o vigilancias.',
      );
    }

    const seg = this.seguimientoRepository.create({
      examenMedicoId: examenId,
      tipo: dto.tipo,
      cie10Code: dto.cie10_code,
      cie10Description: dto.cie10_description ?? null,
      especialidad: dto.especialidad,
      estado: (dto.estado as EstadoSeguimiento) ?? EstadoSeguimiento.PENDIENTE,
      plazo: new Date(dto.plazo),
      motivo: dto.motivo ?? null,
    });
    const saved = await this.seguimientoRepository.save(seg);
    return this.findSeguimientosExamen(examenId);
  }

  async updateSeguimiento(
    examenId: string,
    segId: string,
    dto: UpdateSeguimientoMedicoDto,
    user?: { id: string; roles: string[] },
  ) {
    const seg = await this.seguimientoRepository.findOne({
      where: { id: segId, examenMedicoId: examenId },
    });
    if (!seg) throw new NotFoundException('Seguimiento no encontrado');
    if (!user || !this.isProfesionalSalud(user.roles)) {
      throw new ForbiddenException(
        'Solo el profesional de salud puede modificar seguimientos.',
      );
    }

    if (dto.cie10_code !== undefined) seg.cie10Code = dto.cie10_code;
    if (dto.cie10_description !== undefined) seg.cie10Description = dto.cie10_description;
    if (dto.especialidad !== undefined) seg.especialidad = dto.especialidad;
    if (dto.estado !== undefined) seg.estado = dto.estado;
    if (dto.plazo !== undefined) seg.plazo = new Date(dto.plazo);
    if (dto.motivo !== undefined) seg.motivo = dto.motivo;

    await this.seguimientoRepository.save(seg);
    return this.findSeguimientosExamen(examenId);
  }

  async removeSeguimiento(
    examenId: string,
    segId: string,
    user?: { id: string; roles: string[] },
  ): Promise<void> {
    const seg = await this.seguimientoRepository.findOne({
      where: { id: segId, examenMedicoId: examenId },
    });
    if (!seg) throw new NotFoundException('Seguimiento no encontrado');
    if (!user || !this.isProfesionalSalud(user.roles)) {
      throw new ForbiddenException(
        'Solo el profesional de salud puede eliminar seguimientos.',
      );
    }
    await this.seguimientoRepository.softRemove(seg);
  }

  /**
   * Genera nombre estandarizado: APELLIDO_NOMBRE_PRUEBA_MEDICA_NN.ext
   * Todo en mayúsculas, espacios por guiones bajos.
   */
  private generarNombreArchivoEstandar(
    trabajador: { apellidoPaterno?: string | null; apellidoMaterno?: string | null; nombres?: string | null; nombreCompleto?: string },
    pruebaSlug: string,
    numero: number,
    extension: string,
  ): string {
    const slug = (s: string) =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '') || 'SIN_NOMBRE';

    let nombreParte: string;
    if (trabajador.apellidoPaterno || trabajador.apellidoMaterno || trabajador.nombres) {
      const ap = slug(trabajador.apellidoPaterno ?? '');
      const am = slug(trabajador.apellidoMaterno ?? '');
      const nom = slug(trabajador.nombres ?? '');
      nombreParte = [ap, am, nom].filter(Boolean).join('_');
    } else {
      nombreParte = slug(trabajador.nombreCompleto ?? 'SIN_NOMBRE');
    }
    const numStr = String(numero).padStart(2, '0');
    return `${nombreParte}_${pruebaSlug}_${numStr}.${extension}`;
  }

  async uploadDocumentoExamen(
    examenId: string,
    file: Express.Multer.File,
    pruebaMedicaId: string | null,
    tipoEtiquetaFallback: string | null,
    user?: { id: string; roles: string[] },
  ): Promise<{ id: string; url: string; nombre_archivo: string }> {
    const examen = await this.examenRepository.findOne({
      where: { id: examenId },
      relations: ['trabajador', 'trabajador.empresa'],
    });
    if (!examen) throw new NotFoundException('Examen no encontrado');

    if (!pruebaMedicaId?.trim() && !tipoEtiquetaFallback?.trim()) {
      throw new BadRequestException('Debe seleccionar una prueba médica o indicar el tipo');
    }

    const trabajador = examen.trabajador as {
      apellidoPaterno?: string | null;
      apellidoMaterno?: string | null;
      nombres?: string | null;
      nombreCompleto?: string;
      empresa?: { ruc?: string };
    } | undefined;

    let pruebaSlug: string;
    if (pruebaMedicaId?.trim()) {
      const prueba = await this.pruebaMedicaRepository.findOne({
        where: { id: pruebaMedicaId.trim() },
        select: ['nombre'],
      });
      pruebaSlug = (prueba?.nombre ?? tipoEtiquetaFallback ?? 'OTROS')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '') || 'OTROS';
    } else {
      pruebaSlug = (tipoEtiquetaFallback ?? 'OTROS')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '') || 'OTROS';
    }

    const count = await this.documentoExamenRepo.count({
      where: pruebaMedicaId?.trim()
        ? { examenId, pruebaMedicaId: pruebaMedicaId.trim() }
        : { examenId, pruebaMedicaId: IsNull() },
    });
    const numero = count + 1;

    const ext = (file.originalname?.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf';
    const nombreArchivo = this.generarNombreArchivoEstandar(
      trabajador ?? { nombreCompleto: 'SIN_NOMBRE' },
      pruebaSlug,
      numero,
      ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'pdf',
    );

    let ruc = 'sst';
    if (trabajador?.empresa?.ruc) {
      ruc = trabajador.empresa.ruc.replace(/[^a-zA-Z0-9]/g, '_');
    }

    const url = await this.storageService.uploadFile(ruc, file.buffer, 'documento_emo', {
      contentType: file.mimetype,
      filename: nombreArchivo,
    });

    const doc = this.documentoExamenRepo.create({
      examenId,
      pruebaMedicaId: pruebaMedicaId?.trim() || null,
      tipoEtiqueta: tipoEtiquetaFallback?.trim() || null,
      nombreArchivo,
      url,
    });
    const saved = await this.documentoExamenRepo.save(doc);
    return { id: saved.id, url, nombre_archivo: nombreArchivo };
  }

  async removeDocumentoExamen(examenId: string, docId: string): Promise<void> {
    const doc = await this.documentoExamenRepo.findOne({
      where: { id: docId, examenId },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    await this.documentoExamenRepo.remove(doc);
  }

  /**
   * Sube la Ficha EMO (Anexo 02 / resultado) como PDF.
   * Solo profesional de salud. El archivo se guarda como confidencial.
   */
  async uploadResultadoExamen(
    examenId: string,
    file: Express.Multer.File,
    user?: { id: string; roles: string[] },
  ): Promise<{ url: string }> {
    const examen = await this.examenRepository.findOne({
      where: { id: examenId },
      relations: ['trabajador', 'trabajador.empresa'],
    });
    if (!examen) throw new NotFoundException('Examen no encontrado');

    if (!user || !this.isProfesionalSalud(user.roles)) {
      throw new ForbiddenException(
        'Solo el profesional de salud puede subir la Ficha EMO (Anexo 02).',
      );
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permite subir archivos PDF');
    }
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe superar 10 MB');
    }

    const trabajador = examen.trabajador as { empresa?: { ruc?: string } } | undefined;
    let ruc = 'sst';
    if (trabajador?.empresa?.ruc) {
      ruc = trabajador.empresa.ruc.replace(/[^a-zA-Z0-9]/g, '_');
    }

    const ext = (file.originalname?.split('.').pop() || 'pdf').toLowerCase();
    const nombreArchivo = `ficha_emo_${examenId.slice(0, 8)}_${Date.now()}.${ext === 'pdf' ? 'pdf' : 'pdf'}`;

    const url = await this.storageService.uploadFile(ruc, file.buffer, 'ficha_emo', {
      contentType: 'application/pdf',
      filename: nombreArchivo,
    });

    examen.resultadoArchivoUrl = url;
    await this.examenRepository.save(examen);

    return { url };
  }

  /**
   * Genera URL firmada para un documento de examen (bucket privado GCS).
   * Verifica rol del usuario antes de devolver. Expira en 10 minutos.
   * Registra el acceso en auditoría.
   */
  async getSignedUrlForDocumentoExamen(
    examenId: string,
    docId: string,
    user: { id: string; roles: string[] },
    contexto?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ url: string }> {
    if (!this.puedeVerDocumentosExamen(user.roles)) {
      throw new ForbiddenException('No tiene permiso para ver documentos de este examen');
    }

    const doc = await this.documentoExamenRepo.findOne({
      where: { id: docId, examenId },
      relations: ['pruebaMedica', 'examen', 'examen.trabajador'],
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    if (!doc.url?.includes('storage.googleapis.com')) {
      return { url: doc.url };
    }

    if (!this.storageService.isAvailable()) {
      throw new BadRequestException(
        'El almacenamiento GCS no está configurado. Configure GCP_BUCKET_NAME y GCP_KEY_FILE.',
      );
    }

    try {
      const signedUrl = await this.storageService.getSignedUrl(doc.url, 10);

      const examen = doc.examen as ExamenMedico & { trabajador?: { nombreCompleto?: string } };
      const trabajadorNombre = examen?.trabajador?.nombreCompleto ?? 'Sin nombre';
      const pruebaNombre = (doc as any).pruebaMedica?.nombre ?? doc.tipoEtiqueta ?? 'Documento';

      this.auditoriaService.registrarAcceso({
        usuarioId: user.id,
        usuarioNombre: await this.getUsuarioNombre(user.id),
        accion: 'Visualización',
        recursoTipo: 'documento_examen',
        recursoId: docId,
        recursoDescripcion: `${pruebaNombre} - ${trabajadorNombre}`,
        examenId,
        trabajadorId: (examen as any).trabajadorId,
        trabajadorNombre,
        ipAddress: contexto?.ipAddress ?? null,
        userAgent: contexto?.userAgent ?? null,
      }).catch(() => {});

      return { url: signedUrl };
    } catch (err) {
      throw new BadRequestException(
        `No se pudo generar la URL de acceso temporal. Verifique que GCP_KEY_FILE apunte a una cuenta de servicio con rol "Storage Object Viewer" en el bucket. ${(err as Error).message}`,
      );
    }
  }

  private async getUsuarioNombre(usuarioId: string): Promise<string> {
    const u = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
      select: ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'dni'],
    });
    if (!u) return 'Usuario';
    const nombre = [u.nombres, u.apellidoPaterno, u.apellidoMaterno].filter(Boolean).join(' ').trim();
    return nombre || u.dni || 'Usuario';
  }

  /**
   * Genera URL firmada para el archivo de resultado del examen (bucket privado GCS).
   * Registra el acceso en auditoría.
   */
  async getSignedUrlResultadoExamen(
    examenId: string,
    user: { id: string; roles: string[] },
    contexto?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ url: string }> {
    if (!this.puedeVerDocumentosExamen(user.roles)) {
      throw new ForbiddenException('No tiene permiso para ver el resultado de este examen');
    }

    const examen = await this.examenRepository.findOne({
      where: { id: examenId },
      relations: ['trabajador'],
    });
    if (!examen) throw new NotFoundException('Examen no encontrado');
    if (!examen.resultadoArchivoUrl) throw new NotFoundException('No hay archivo de resultado');

    if (!examen.resultadoArchivoUrl.includes('storage.googleapis.com')) {
      return { url: examen.resultadoArchivoUrl };
    }

    if (!this.storageService.isAvailable()) {
      return { url: examen.resultadoArchivoUrl };
    }

    const signedUrl = await this.storageService.getSignedUrl(examen.resultadoArchivoUrl, 10);

    const trabajador = (examen as any).trabajador;
    const trabajadorNombre = trabajador?.nombreCompleto ?? 'Sin nombre';

    this.auditoriaService.registrarAcceso({
      usuarioId: user.id,
      usuarioNombre: await this.getUsuarioNombre(user.id),
      accion: 'Visualización',
      recursoTipo: 'resultado_examen',
      recursoId: examenId,
      recursoDescripcion: `Resultado - ${trabajadorNombre}`,
      examenId,
      trabajadorId: examen.trabajadorId,
      trabajadorNombre,
      ipAddress: contexto?.ipAddress ?? null,
      userAgent: contexto?.userAgent ?? null,
    }).catch(() => {});

    return { url: signedUrl };
  }

  async notificarResultadosListos(
    examenId: string,
    user?: { id: string; roles: string[] },
  ): Promise<ResponseExamenMedicoDto> {
    const examen = await this.examenRepository.findOne({ where: { id: examenId } });
    if (!examen) throw new NotFoundException('Examen no encontrado');
    examen.estado = EstadoExamen.PruebasCargadas;
    examen.fechaRealizado = new Date();
    await this.examenRepository.save(examen);
    return this.findOneExamen(examenId, user);
  }
}
