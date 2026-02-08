import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Contratista,
  EstadoContratista,
} from './entities/contratista.entity';
import {
  DocumentoContratista,
  EstadoDocumento,
} from './entities/documento-contratista.entity';
import { CreateContratistaDto } from './dto/create-contratista.dto';
import { UpdateContratistaDto } from './dto/update-contratista.dto';
import { ResponseContratistaDto } from './dto/response-contratista.dto';

@Injectable()
export class ContratistasService {
  constructor(
    @InjectRepository(Contratista)
    private readonly contratistaRepository: Repository<Contratista>,
    @InjectRepository(DocumentoContratista)
    private readonly documentoRepository: Repository<DocumentoContratista>,
  ) {}

  async create(dto: CreateContratistaDto): Promise<ResponseContratistaDto> {
    // Verificar unicidad del RUC
    const existing = await this.contratistaRepository.findOne({
      where: { ruc: dto.ruc },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un contratista con RUC ${dto.ruc}`);
    }

    const contratista = this.contratistaRepository.create({
      ruc: dto.ruc,
      razonSocial: dto.razon_social,
      tipoServicio: dto.tipo_servicio,
      representanteLegal: dto.representante_legal,
      contactoPrincipal: dto.contacto_principal,
      telefono: dto.telefono,
      email: dto.email,
      estado: dto.estado ?? EstadoContratista.EnEvaluacion,
      evaluacionDesempeno: dto.evaluacion_desempeno ?? null,
      observaciones: dto.observaciones ?? null,
      empresaId: dto.empresa_id,
      supervisorAsignadoId: dto.supervisor_asignado_id ?? null,
    });

    const saved = await this.contratistaRepository.save(contratista);

    // Guardar documentos
    if (dto.documentos && dto.documentos.length > 0) {
      const documentos = dto.documentos.map((doc) => {
        const estadoDoc = this.calcularEstadoDocumento(
          new Date(doc.fecha_vencimiento),
        );
        return this.documentoRepository.create({
          contratistaId: saved.id,
          tipoDocumento: doc.tipo_documento,
          archivoUrl: doc.archivo_url,
          fechaEmision: new Date(doc.fecha_emision),
          fechaVencimiento: new Date(doc.fecha_vencimiento),
          estadoDoc,
        });
      });
      await this.documentoRepository.save(documentos);

      // Validar estado del contratista según documentos
      await this.validarEstadoContratista(saved.id);
    }

    return this.findOne(saved.id);
  }

  async findAll(empresaId?: string): Promise<ResponseContratistaDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const contratistas = await this.contratistaRepository.find({
      where,
      relations: ['supervisorAsignado', 'documentos'],
      order: { razonSocial: 'ASC' },
    });

    return contratistas.map((c) => ResponseContratistaDto.fromEntity(c));
  }

  async findOne(id: string): Promise<ResponseContratistaDto> {
    const contratista = await this.contratistaRepository.findOne({
      where: { id },
      relations: ['supervisorAsignado', 'documentos'],
    });

    if (!contratista) {
      throw new NotFoundException(`Contratista con ID ${id} no encontrado`);
    }

    return ResponseContratistaDto.fromEntity(contratista);
  }

  async update(
    id: string,
    dto: UpdateContratistaDto,
  ): Promise<ResponseContratistaDto> {
    const contratista = await this.contratistaRepository.findOne({
      where: { id },
      relations: ['documentos'],
    });

    if (!contratista) {
      throw new NotFoundException(`Contratista con ID ${id} no encontrado`);
    }

    // Validar RUC único si cambia
    if (dto.ruc && dto.ruc !== contratista.ruc) {
      const existing = await this.contratistaRepository.findOne({
        where: { ruc: dto.ruc },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un contratista con RUC ${dto.ruc}`);
      }
    }

    // Actualizar campos
    Object.assign(contratista, {
      ruc: dto.ruc ?? contratista.ruc,
      razonSocial: dto.razon_social ?? contratista.razonSocial,
      tipoServicio: dto.tipo_servicio ?? contratista.tipoServicio,
      representanteLegal: dto.representante_legal ?? contratista.representanteLegal,
      contactoPrincipal: dto.contacto_principal ?? contratista.contactoPrincipal,
      telefono: dto.telefono ?? contratista.telefono,
      email: dto.email ?? contratista.email,
      evaluacionDesempeno: dto.evaluacion_desempeno ?? contratista.evaluacionDesempeno,
      observaciones: dto.observaciones ?? contratista.observaciones,
      supervisorAsignadoId: dto.supervisor_asignado_id ?? contratista.supervisorAsignadoId,
    });

    // Validar estado si cambia
    if (dto.estado && dto.estado !== contratista.estado) {
      if (dto.estado === EstadoContratista.Activo) {
        await this.validarDocumentosParaActivo(contratista.documentos || []);
      }
      contratista.estado = dto.estado;
    }

    await this.contratistaRepository.save(contratista);

    // Validar estado después de actualizar documentos
    if (dto.documentos) {
      await this.documentoRepository.delete({ contratistaId: id });
      if (dto.documentos.length > 0) {
        const documentos = dto.documentos.map((doc) => {
          const estadoDoc = this.calcularEstadoDocumento(
            new Date(doc.fecha_vencimiento),
          );
          return this.documentoRepository.create({
            contratistaId: id,
            tipoDocumento: doc.tipo_documento,
            archivoUrl: doc.archivo_url,
            fechaEmision: new Date(doc.fecha_emision),
            fechaVencimiento: new Date(doc.fecha_vencimiento),
            estadoDoc,
          });
        });
        await this.documentoRepository.save(documentos);
      }
      await this.validarEstadoContratista(id);
    }

    return this.findOne(id);
  }

  calcularEstadoDocumento(fechaVencimiento: Date): EstadoDocumento {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);

    const diasRestantes = Math.ceil(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diasRestantes < 0) {
      return EstadoDocumento.Vencido;
    } else if (diasRestantes <= 30) {
      return EstadoDocumento.PorVencer;
    } else {
      return EstadoDocumento.Vigente;
    }
  }

  async validarDocumentosParaActivo(documentos: DocumentoContratista[]): Promise<void> {
    const documentosCriticos = documentos.filter(
      (doc) =>
        doc.tipoDocumento === 'Póliza' ||
        doc.tipoDocumento === 'SCTR' ||
        doc.tipoDocumento === 'Plan SST',
    );

    const documentosVencidos = documentosCriticos.filter(
      (doc) => doc.estadoDoc === EstadoDocumento.Vencido,
    );

    if (documentosVencidos.length > 0) {
      throw new BadRequestException(
        'No se puede activar un contratista con documentos críticos vencidos',
      );
    }
  }

  async validarEstadoContratista(contratistaId: string): Promise<void> {
    const contratista = await this.contratistaRepository.findOne({
      where: { id: contratistaId },
      relations: ['documentos'],
    });

    if (!contratista) return;

    const documentosVencidos = contratista.documentos?.some(
      (doc) => doc.estadoDoc === EstadoDocumento.Vencido,
    );

    if (documentosVencidos && contratista.estado === EstadoContratista.Activo) {
      contratista.estado = EstadoContratista.Suspendido;
      await this.contratistaRepository.save(contratista);
    }
  }

  async remove(id: string): Promise<void> {
    const contratista = await this.contratistaRepository.findOne({ where: { id } });

    if (!contratista) {
      throw new NotFoundException(`Contratista con ID ${id} no encontrado`);
    }

    await this.contratistaRepository.remove(contratista);
  }
}
