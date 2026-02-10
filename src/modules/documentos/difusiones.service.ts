import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DifusionDocumento, EstadoDifusion } from './entities/difusion-documento.entity';
import { DifusionFirma } from './entities/difusion-firma.entity';
import { DocumentoSST } from './entities/documento-sst.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { CreateDifusionDocumentoDto } from './dto/create-difusion-documento.dto';
import { UpdateDifusionDocumentoDto } from './dto/update-difusion-documento.dto';
import { ResponseDifusionDocumentoDto } from './dto/response-difusion-documento.dto';

@Injectable()
export class DifusionesService {
  constructor(
    @InjectRepository(DifusionDocumento)
    private readonly difusionRepository: Repository<DifusionDocumento>,
    @InjectRepository(DifusionFirma)
    private readonly firmaRepository: Repository<DifusionFirma>,
    @InjectRepository(DocumentoSST)
    private readonly documentoRepository: Repository<DocumentoSST>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  async create(dto: CreateDifusionDocumentoDto): Promise<ResponseDifusionDocumentoDto> {
    // Validar que el documento existe y está aprobado/vigente
    const documento = await this.documentoRepository.findOne({
      where: { id: dto.documento_id },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${dto.documento_id} no encontrado`);
    }

    if (!documento.activo) {
      throw new BadRequestException('Solo se pueden difundir documentos activos');
    }

    if (documento.formato.toUpperCase() !== 'PDF') {
      throw new BadRequestException('Solo se pueden difundir archivos PDF');
    }

    // Crear la difusión
    const difusion = this.difusionRepository.create({
      documentoId: dto.documento_id,
      fechaDifusion: new Date(dto.fecha_difusion),
      requiereFirma: dto.requiere_firma ?? true,
      estado: EstadoDifusion.EnProceso,
      empresaId: dto.empresa_id,
      responsableId: dto.responsable_id,
    });

    const savedDifusion = await this.difusionRepository.save(difusion);

    // Obtener todos los trabajadores activos de la empresa
    const trabajadores = await this.trabajadorRepository.find({
      where: {
        empresaId: dto.empresa_id,
        estado: 'Activo' as any,
      },
    });

    // Crear registros de firma para cada trabajador (si requiere firma)
    if (savedDifusion.requiereFirma) {
      const firmas = trabajadores.map((trabajador) =>
        this.firmaRepository.create({
          difusionId: savedDifusion.id,
          trabajadorId: trabajador.id,
        }),
      );
      await this.firmaRepository.save(firmas);
    }

    return this.findOne(savedDifusion.id);
  }

  async findAll(
    empresaId?: string,
    estado?: EstadoDifusion,
    documentoId?: string,
  ): Promise<ResponseDifusionDocumentoDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }
    if (estado) {
      where.estado = estado;
    }
    if (documentoId) {
      where.documentoId = documentoId;
    }

    const difusiones = await this.difusionRepository.find({
      where,
      relations: ['documento', 'empresa', 'responsable'],
      order: { fechaDifusion: 'DESC' },
    });

    // Calcular métricas para cada difusión
    const difusionesConMetricas = await Promise.all(
      difusiones.map(async (difusion) => {
        const trabajadores = await this.trabajadorRepository.count({
          where: { empresaId: difusion.empresaId, estado: 'Activo' as any },
        });

        const firmadas = await this.firmaRepository
          .createQueryBuilder('firma')
          .where('firma.difusionId = :difusionId', { difusionId: difusion.id })
          .andWhere('firma.fechaFirma IS NOT NULL')
          .getCount();

        return {
          ...difusion,
          totalTrabajadores: trabajadores,
          totalFirmas: difusion.requiereFirma ? firmadas : 0,
        };
      }),
    );

    return difusionesConMetricas.map((d) =>
      ResponseDifusionDocumentoDto.fromEntity(d),
    );
  }

  async findOne(id: string): Promise<ResponseDifusionDocumentoDto> {
    const difusion = await this.difusionRepository.findOne({
      where: { id },
      relations: ['documento', 'empresa', 'responsable'],
    });

    if (!difusion) {
      throw new NotFoundException(`Difusión con ID ${id} no encontrada`);
    }

    const trabajadores = await this.trabajadorRepository.count({
      where: { empresaId: difusion.empresaId, estado: 'Activo' as any },
    });

    const firmadas = await this.firmaRepository
      .createQueryBuilder('firma')
      .where('firma.difusionId = :difusionId', { difusionId: difusion.id })
      .andWhere('firma.fechaFirma IS NOT NULL')
      .getCount();

    return ResponseDifusionDocumentoDto.fromEntity({
      ...difusion,
      totalTrabajadores: trabajadores,
      totalFirmas: difusion.requiereFirma ? firmadas : 0,
    });
  }

  async update(
    id: string,
    dto: UpdateDifusionDocumentoDto,
  ): Promise<ResponseDifusionDocumentoDto> {
    const difusion = await this.difusionRepository.findOne({ where: { id } });

    if (!difusion) {
      throw new NotFoundException(`Difusión con ID ${id} no encontrada`);
    }

    if (dto.estado !== undefined) {
      difusion.estado = dto.estado;
    }

    await this.difusionRepository.save(difusion);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const difusion = await this.difusionRepository.findOne({ where: { id } });

    if (!difusion) {
      throw new NotFoundException(`Difusión con ID ${id} no encontrada`);
    }

    await this.difusionRepository.softRemove(difusion);
  }
}
