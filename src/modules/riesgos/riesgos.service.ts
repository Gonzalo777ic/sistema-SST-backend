import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EvaluacionRiesgo,
  EstadoEvaluacionRiesgo,
  Probabilidad,
  Consecuencia,
  NivelRiesgo,
} from './entities/evaluacion-riesgo.entity';
import { MedidaControl } from './entities/medida-control.entity';
import { CreateEvaluacionRiesgoDto } from './dto/create-evaluacion-riesgo.dto';
import { UpdateEvaluacionRiesgoDto } from './dto/update-evaluacion-riesgo.dto';
import { ResponseEvaluacionRiesgoDto } from './dto/response-evaluacion-riesgo.dto';

@Injectable()
export class RiesgosService {
  constructor(
    @InjectRepository(EvaluacionRiesgo)
    private readonly evaluacionRepository: Repository<EvaluacionRiesgo>,
    @InjectRepository(MedidaControl)
    private readonly medidaRepository: Repository<MedidaControl>,
  ) {}

  /**
   * Calcula el nivel de riesgo basado en probabilidad y consecuencia
   */
  calcularNivelRiesgo(
    probabilidad: Probabilidad,
    consecuencia: Consecuencia,
  ): NivelRiesgo {
    const matriz: Record<Probabilidad, Record<Consecuencia, NivelRiesgo>> = {
      [Probabilidad.MuyBaja]: {
        [Consecuencia.Insignificante]: NivelRiesgo.Trivial,
        [Consecuencia.Menor]: NivelRiesgo.Trivial,
        [Consecuencia.Moderada]: NivelRiesgo.Tolerable,
        [Consecuencia.Mayor]: NivelRiesgo.Tolerable,
        [Consecuencia.Catastrofica]: NivelRiesgo.Moderado,
      },
      [Probabilidad.Baja]: {
        [Consecuencia.Insignificante]: NivelRiesgo.Trivial,
        [Consecuencia.Menor]: NivelRiesgo.Tolerable,
        [Consecuencia.Moderada]: NivelRiesgo.Tolerable,
        [Consecuencia.Mayor]: NivelRiesgo.Moderado,
        [Consecuencia.Catastrofica]: NivelRiesgo.Importante,
      },
      [Probabilidad.Media]: {
        [Consecuencia.Insignificante]: NivelRiesgo.Tolerable,
        [Consecuencia.Menor]: NivelRiesgo.Tolerable,
        [Consecuencia.Moderada]: NivelRiesgo.Moderado,
        [Consecuencia.Mayor]: NivelRiesgo.Importante,
        [Consecuencia.Catastrofica]: NivelRiesgo.Intolerable,
      },
      [Probabilidad.Alta]: {
        [Consecuencia.Insignificante]: NivelRiesgo.Tolerable,
        [Consecuencia.Menor]: NivelRiesgo.Moderado,
        [Consecuencia.Moderada]: NivelRiesgo.Importante,
        [Consecuencia.Mayor]: NivelRiesgo.Intolerable,
        [Consecuencia.Catastrofica]: NivelRiesgo.Intolerable,
      },
      [Probabilidad.MuyAlta]: {
        [Consecuencia.Insignificante]: NivelRiesgo.Moderado,
        [Consecuencia.Menor]: NivelRiesgo.Importante,
        [Consecuencia.Moderada]: NivelRiesgo.Intolerable,
        [Consecuencia.Mayor]: NivelRiesgo.Intolerable,
        [Consecuencia.Catastrofica]: NivelRiesgo.Intolerable,
      },
    };

    return matriz[probabilidad][consecuencia];
  }

  async create(dto: CreateEvaluacionRiesgoDto): Promise<ResponseEvaluacionRiesgoDto> {
    // Calcular nivel de riesgo si no se proporciona
    const nivelRiesgoCalculado = this.calcularNivelRiesgo(
      dto.probabilidad,
      dto.consecuencia,
    );

    // Validar que el nivel de riesgo coincida con la matriz
    if (dto.nivel_riesgo !== nivelRiesgoCalculado) {
      throw new BadRequestException(
        `El nivel de riesgo debe ser ${nivelRiesgoCalculado} según la matriz de probabilidad y consecuencia`,
      );
    }

    // Validar riesgo residual
    if (dto.riesgo_residual) {
      const nivelesOrdenados = [
        NivelRiesgo.Trivial,
        NivelRiesgo.Tolerable,
        NivelRiesgo.Moderado,
        NivelRiesgo.Importante,
        NivelRiesgo.Intolerable,
      ];
      const indiceInicial = nivelesOrdenados.indexOf(dto.nivel_riesgo);
      const indiceResidual = nivelesOrdenados.indexOf(dto.riesgo_residual);

      if (indiceResidual > indiceInicial) {
        throw new BadRequestException(
          'El riesgo residual no puede ser mayor que el riesgo inicial',
        );
      }
    }

    const evaluacion = this.evaluacionRepository.create({
      actividad: dto.actividad,
      peligroIdentificado: dto.peligro_identificado,
      tipoPeligro: dto.tipo_peligro,
      fechaEvaluacion: new Date(dto.fecha_evaluacion),
      probabilidad: dto.probabilidad,
      consecuencia: dto.consecuencia,
      nivelRiesgo: dto.nivel_riesgo,
      controlesActuales: dto.controles_actuales ?? null,
      riesgoResidual: dto.riesgo_residual ?? null,
      estado: dto.estado ?? EstadoEvaluacionRiesgo.Pendiente,
      empresaId: dto.empresa_id,
      areaId: dto.area_id ?? null,
      evaluadorId: dto.evaluador_id,
      ipercPadreId: dto.iperc_padre_id ?? null,
    });

    const saved = await this.evaluacionRepository.save(evaluacion);

    // Guardar medidas de control
    if (dto.medidas_control && dto.medidas_control.length > 0) {
      const medidas = dto.medidas_control.map((m) =>
        this.medidaRepository.create({
          evaluacionRiesgoId: saved.id,
          jerarquia: m.jerarquia,
          descripcion: m.descripcion,
          responsable: m.responsable ?? null,
          responsableId: m.responsable_id ?? null,
          fechaImplementacion: m.fecha_implementacion
            ? new Date(m.fecha_implementacion)
            : null,
          estadoMedida: m.estado ?? m.estado,
        }),
      );
      await this.medidaRepository.save(medidas);
    }

    return this.findOne(saved.id);
  }

  async findAll(empresaId?: string, areaId?: string): Promise<ResponseEvaluacionRiesgoDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }
    if (areaId) {
      where.areaId = areaId;
    }

    const evaluaciones = await this.evaluacionRepository.find({
      where,
      relations: ['area', 'evaluador', 'medidasControl'],
      order: { fechaEvaluacion: 'DESC' },
    });

    return evaluaciones.map((e) => ResponseEvaluacionRiesgoDto.fromEntity(e));
  }

  async findOne(id: string): Promise<ResponseEvaluacionRiesgoDto> {
    const evaluacion = await this.evaluacionRepository.findOne({
      where: { id },
      relations: ['area', 'evaluador', 'medidasControl'],
    });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación de riesgo con ID ${id} no encontrada`);
    }

    return ResponseEvaluacionRiesgoDto.fromEntity(evaluacion);
  }

  async update(
    id: string,
    dto: UpdateEvaluacionRiesgoDto,
  ): Promise<ResponseEvaluacionRiesgoDto> {
    const evaluacion = await this.evaluacionRepository.findOne({
      where: { id },
      relations: ['medidasControl'],
    });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación de riesgo con ID ${id} no encontrada`);
    }

    // Validar inmutabilidad si está Aprobada
    if (evaluacion.estado === EstadoEvaluacionRiesgo.Aprobada) {
      throw new BadRequestException(
        'No se puede editar una evaluación que está Aprobada. Debe crear una nueva versión.',
      );
    }

    // Recalcular nivel de riesgo si cambian probabilidad o consecuencia
    if (dto.probabilidad || dto.consecuencia) {
      const prob = dto.probabilidad ?? evaluacion.probabilidad;
      const cons = dto.consecuencia ?? evaluacion.consecuencia;
      const nivelCalculado = this.calcularNivelRiesgo(prob, cons);

      if (dto.nivel_riesgo && dto.nivel_riesgo !== nivelCalculado) {
        throw new BadRequestException(
          `El nivel de riesgo debe ser ${nivelCalculado} según la matriz`,
        );
      }

      if (!dto.nivel_riesgo) {
        evaluacion.nivelRiesgo = nivelCalculado;
      }
    }

    // Actualizar campos
    Object.assign(evaluacion, {
      actividad: dto.actividad ?? evaluacion.actividad,
      peligroIdentificado: dto.peligro_identificado ?? evaluacion.peligroIdentificado,
      tipoPeligro: dto.tipo_peligro ?? evaluacion.tipoPeligro,
      fechaEvaluacion: dto.fecha_evaluacion
        ? new Date(dto.fecha_evaluacion)
        : evaluacion.fechaEvaluacion,
      probabilidad: dto.probabilidad ?? evaluacion.probabilidad,
      consecuencia: dto.consecuencia ?? evaluacion.consecuencia,
      nivelRiesgo: dto.nivel_riesgo ?? evaluacion.nivelRiesgo,
      controlesActuales: dto.controles_actuales ?? evaluacion.controlesActuales,
      riesgoResidual: dto.riesgo_residual ?? evaluacion.riesgoResidual,
      estado: dto.estado ?? evaluacion.estado,
      areaId: dto.area_id ?? evaluacion.areaId,
      ipercPadreId: dto.iperc_padre_id ?? evaluacion.ipercPadreId,
    });

    await this.evaluacionRepository.save(evaluacion);

    // Actualizar medidas de control
    if (dto.medidas_control) {
      await this.medidaRepository.delete({ evaluacionRiesgoId: id });
      if (dto.medidas_control.length > 0) {
        const medidas = dto.medidas_control.map((m) =>
          this.medidaRepository.create({
            evaluacionRiesgoId: id,
            jerarquia: m.jerarquia,
            descripcion: m.descripcion,
            responsable: m.responsable ?? null,
            responsableId: m.responsable_id ?? null,
            fechaImplementacion: m.fecha_implementacion
              ? new Date(m.fecha_implementacion)
              : null,
            estadoMedida: m.estado ?? m.estado,
          }),
        );
        await this.medidaRepository.save(medidas);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id } });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación de riesgo con ID ${id} no encontrada`);
    }

    await this.evaluacionRepository.remove(evaluacion);
  }
}
