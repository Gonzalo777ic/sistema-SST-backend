import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

@Injectable()
export class SaludService {
  constructor(
    @InjectRepository(ExamenMedico)
    private readonly examenRepository: Repository<ExamenMedico>,
    @InjectRepository(CitaMedica)
    private readonly citaRepository: Repository<CitaMedica>,
    @InjectRepository(ComentarioMedico)
    private readonly comentarioRepository: Repository<ComentarioMedico>,
    @InjectRepository(HorarioDoctor)
    private readonly horarioRepository: Repository<HorarioDoctor>,
  ) {}

  private isProfesionalSalud(roles: string[]): boolean {
    return roles?.some(
      (r) => r === UsuarioRol.MEDICO || r === UsuarioRol.CENTRO_MEDICO,
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

  async findAllExamenes(trabajadorId?: string): Promise<ResponseExamenMedicoDto[]> {
    const where: any = {};
    if (trabajadorId) {
      where.trabajadorId = trabajadorId;
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
      relations: ['trabajador', 'cargadoPor'],
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
    if (dto.resultado_archivo_url !== undefined)
      examen.resultadoArchivoUrl = dto.resultado_archivo_url;
    if (dto.estado !== undefined) examen.estado = dto.estado;

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

  async findAllCitas(trabajadorId?: string, doctorId?: string): Promise<ResponseCitaMedicaDto[]> {
    const where: any = {};
    if (trabajadorId) {
      where.trabajadorId = trabajadorId;
    }
    if (doctorId) {
      where.doctorId = doctorId;
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
}
