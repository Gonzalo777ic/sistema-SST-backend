import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPERC, EstadoIPERC } from './entities/iperc.entity';
import { LineaIPERC, NivelRiesgo } from './entities/linea-iperc.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CreateIpercDto } from './dto/create-iperc.dto';
import { UpdateIpercDto } from './dto/update-iperc.dto';
import { ResponseIpercDto } from './dto/response-iperc.dto';

@Injectable()
export class IpercService {
  constructor(
    @InjectRepository(IPERC)
    private readonly ipercRepository: Repository<IPERC>,
    @InjectRepository(LineaIPERC)
    private readonly lineaRepository: Repository<LineaIPERC>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  calculateIndiceProbabilidad(
    a: number,
    b: number,
    c: number,
    d: number,
  ): number {
    return a + b + c + d;
  }

  calculateValorRiesgo(
    indiceProbabilidad: number,
    indiceSeveridad: number,
  ): number {
    return indiceProbabilidad * indiceSeveridad;
  }

  calculateNivelRiesgo(valorRiesgo: number): NivelRiesgo {
    if (valorRiesgo <= 5) return NivelRiesgo.Trivial;
    if (valorRiesgo <= 10) return NivelRiesgo.Tolerable;
    if (valorRiesgo <= 15) return NivelRiesgo.Moderado;
    if (valorRiesgo <= 20) return NivelRiesgo.Importante;
    return NivelRiesgo.Intolerable;
  }

  async create(dto: CreateIpercDto): Promise<ResponseIpercDto> {
    // Obtener razón social automáticamente si no viene en el DTO
    let razonSocial = dto.razon_social;
    if (!razonSocial && dto.empresa_id) {
      const empresa = await this.empresaRepository.findOne({
        where: { id: dto.empresa_id },
      });
      if (empresa) {
        razonSocial = empresa.nombre;
      } else {
        throw new NotFoundException(
          `Empresa con ID ${dto.empresa_id} no encontrada`,
        );
      }
    }

    if (!razonSocial) {
      throw new BadRequestException(
        'La razón social es obligatoria. Debe venir en el DTO o estar vinculada a una empresa válida.',
      );
    }

    const iperc = this.ipercRepository.create({
      razonSocial,
      areaId: dto.area_id ?? null,
      proceso: dto.proceso,
      fechaElaboracion: new Date(dto.fecha_elaboracion),
      firmaElaborador: dto.firma_elaborador ?? null,
      firmaAprobador: dto.firma_aprobador ?? null,
      estado: dto.estado ?? EstadoIPERC.Borrador,
      empresaId: dto.empresa_id,
      elaboradoPorId: dto.elaborado_por_id,
      aprobadoPorId: dto.aprobado_por_id ?? null,
      historialVersiones: [
        {
          version: 1,
          fecha: new Date().toISOString(),
          usuario: dto.elaborado_por || 'Sistema',
          accion: 'Creado',
          estado_anterior: null,
          estado_nuevo: EstadoIPERC.Borrador,
        },
      ],
    });

    const savedIperc = await this.ipercRepository.save(iperc);

    // Guardar líneas IPERC con cálculos automáticos
    if (dto.lineas_iperc && dto.lineas_iperc.length > 0) {
      const lineasEntities = dto.lineas_iperc.map((l) => {
        const indiceProbabilidad = this.calculateIndiceProbabilidad(
          l.probabilidad_a,
          l.probabilidad_b,
          l.probabilidad_c,
          l.probabilidad_d,
        );
        const valorRiesgo = this.calculateValorRiesgo(
          indiceProbabilidad,
          l.indice_severidad,
        );
        const nivelRiesgo = this.calculateNivelRiesgo(valorRiesgo);

        return this.lineaRepository.create({
          ipercId: savedIperc.id,
          numero: l.numero,
          actividad: l.actividad,
          tarea: l.tarea,
          puestoTrabajo: l.puesto_trabajo ?? null,
          peligro: l.peligro,
          riesgo: l.riesgo,
          requisitoLegal: l.requisito_legal ?? null,
          probabilidadA: l.probabilidad_a,
          probabilidadB: l.probabilidad_b,
          probabilidadC: l.probabilidad_c,
          probabilidadD: l.probabilidad_d,
          indiceProbabilidad,
          indiceSeveridad: l.indice_severidad,
          valorRiesgo,
          nivelRiesgo,
          jerarquiaEliminacion: l.jerarquia_eliminacion ?? false,
          jerarquiaSustitucion: l.jerarquia_sustitucion ?? false,
          jerarquiaControlesIngenieria:
            l.jerarquia_controles_ingenieria ?? false,
          jerarquiaControlesAdmin: l.jerarquia_controles_admin ?? false,
          jerarquiaEpp: l.jerarquia_epp ?? false,
          medidasControl: l.medidas_control,
          responsable: l.responsable ?? null,
        });
      });
      await this.lineaRepository.save(lineasEntities);
    }

    return this.findOne(savedIperc.id);
  }

  async findAll(empresaId?: string): Promise<ResponseIpercDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const ipercList = await this.ipercRepository.find({
      where,
      relations: ['elaboradoPor', 'aprobadoPor', 'area', 'lineasIperc'],
      order: { createdAt: 'DESC' },
    });

    return ipercList.map((iperc) => ResponseIpercDto.fromEntity(iperc));
  }

  async findOne(id: string): Promise<ResponseIpercDto> {
    const iperc = await this.ipercRepository.findOne({
      where: { id },
      relations: ['elaboradoPor', 'aprobadoPor', 'area', 'lineasIperc'],
    });

    if (!iperc) {
      throw new NotFoundException(`IPERC con ID ${id} no encontrado`);
    }

    return ResponseIpercDto.fromEntity(iperc);
  }

  async update(id: string, dto: UpdateIpercDto): Promise<ResponseIpercDto> {
    const iperc = await this.ipercRepository.findOne({
      where: { id },
      relations: ['lineasIperc'],
    });

    if (!iperc) {
      throw new NotFoundException(`IPERC con ID ${id} no encontrado`);
    }

    // Validar que no se pueda aprobar sin líneas
    if (
      dto.estado === EstadoIPERC.Aprobado &&
      (!iperc.lineasIperc || iperc.lineasIperc.length === 0)
    ) {
      throw new BadRequestException(
        'No se puede aprobar un IPERC sin líneas de riesgo',
      );
    }

    // Actualizar campos principales
    if (dto.razon_social) iperc.razonSocial = dto.razon_social;
    if (dto.area_id !== undefined) iperc.areaId = dto.area_id;
    if (dto.proceso) iperc.proceso = dto.proceso;
    if (dto.fecha_elaboracion)
      iperc.fechaElaboracion = new Date(dto.fecha_elaboracion);
    if (dto.firma_elaborador !== undefined)
      iperc.firmaElaborador = dto.firma_elaborador;
    if (dto.firma_aprobador !== undefined)
      iperc.firmaAprobador = dto.firma_aprobador;
    if (dto.aprobado_por_id !== undefined)
      iperc.aprobadoPorId = dto.aprobado_por_id;

    // Manejar cambio de estado
    if (dto.estado && dto.estado !== iperc.estado) {
      const historial = iperc.historialVersiones || [];
      historial.push({
        version: historial.length + 1,
        fecha: new Date().toISOString(),
        usuario: 'Sistema',
        accion: 'Cambio de estado',
        estado_anterior: iperc.estado,
        estado_nuevo: dto.estado,
      });
      iperc.historialVersiones = historial;
      iperc.estado = dto.estado;
    }

    await this.ipercRepository.save(iperc);

    // Actualizar líneas IPERC
    if (dto.lineas_iperc) {
      await this.lineaRepository.delete({ ipercId: id });
      if (dto.lineas_iperc.length > 0) {
        const lineasEntities = dto.lineas_iperc.map((l) => {
          const indiceProbabilidad = this.calculateIndiceProbabilidad(
            l.probabilidad_a,
            l.probabilidad_b,
            l.probabilidad_c,
            l.probabilidad_d,
          );
          const valorRiesgo = this.calculateValorRiesgo(
            indiceProbabilidad,
            l.indice_severidad,
          );
          const nivelRiesgo = this.calculateNivelRiesgo(valorRiesgo);

          return this.lineaRepository.create({
            ipercId: id,
            numero: l.numero,
            actividad: l.actividad,
            tarea: l.tarea,
            puestoTrabajo: l.puesto_trabajo ?? null,
            peligro: l.peligro,
            riesgo: l.riesgo,
            requisitoLegal: l.requisito_legal ?? null,
            probabilidadA: l.probabilidad_a,
            probabilidadB: l.probabilidad_b,
            probabilidadC: l.probabilidad_c,
            probabilidadD: l.probabilidad_d,
            indiceProbabilidad,
            indiceSeveridad: l.indice_severidad,
            valorRiesgo,
            nivelRiesgo,
            jerarquiaEliminacion: l.jerarquia_eliminacion ?? false,
            jerarquiaSustitucion: l.jerarquia_sustitucion ?? false,
            jerarquiaControlesIngenieria:
              l.jerarquia_controles_ingenieria ?? false,
            jerarquiaControlesAdmin: l.jerarquia_controles_admin ?? false,
            jerarquiaEpp: l.jerarquia_epp ?? false,
            medidasControl: l.medidas_control,
            responsable: l.responsable ?? null,
          });
        });
        await this.lineaRepository.save(lineasEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ipercRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`IPERC con ID ${id} no encontrado`);
    }
  }
}
