import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoSST } from './entities/documento-sst.entity';
import { CreateDocumentoSstDto } from './dto/create-documento-sst.dto';
import { UpdateDocumentoSstDto } from './dto/update-documento-sst.dto';
import { ResponseDocumentoSstDto } from './dto/response-documento-sst.dto';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentoSST)
    private readonly documentoRepository: Repository<DocumentoSST>,
  ) {}

  async create(dto: CreateDocumentoSstDto): Promise<ResponseDocumentoSstDto> {
    const documento = this.documentoRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      version: dto.version,
      categoria: dto.categoria,
      archivoUrl: dto.archivo_url,
      formato: dto.formato,
      tamano: dto.tamano ?? null,
      fechaPublicacion: new Date(dto.fecha_publicacion),
      activo: dto.activo ?? true,
      empresaId: dto.empresa_id,
      subidoPorId: dto.subido_por_id,
    });

    const saved = await this.documentoRepository.save(documento);
    return this.findOne(saved.id);
  }

  async findAll(
    empresaId?: string,
    activo?: boolean,
    categoria?: string,
  ): Promise<ResponseDocumentoSstDto[]> {
    const where: any = {};
    if (empresaId) {
      where.empresaId = empresaId;
    }
    if (activo !== undefined) {
      where.activo = activo;
    }
    if (categoria) {
      where.categoria = categoria;
    }

    const documentos = await this.documentoRepository.find({
      where,
      relations: ['subidoPor'],
      order: { fechaPublicacion: 'DESC' },
    });

    return documentos.map((d) => ResponseDocumentoSstDto.fromEntity(d));
  }

  async findOne(id: string): Promise<ResponseDocumentoSstDto> {
    const documento = await this.documentoRepository.findOne({
      where: { id },
      relations: ['subidoPor'],
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Incrementar contador de descargas
    documento.descargasCount += 1;
    await this.documentoRepository.save(documento);

    return ResponseDocumentoSstDto.fromEntity(documento);
  }

  async update(
    id: string,
    dto: UpdateDocumentoSstDto,
  ): Promise<ResponseDocumentoSstDto> {
    const documento = await this.documentoRepository.findOne({ where: { id } });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Si se actualiza el archivo, se recomienda crear una nueva versión
    if (dto.archivo_url && dto.archivo_url !== documento.archivoUrl) {
      // Opcional: Marcar el anterior como inactivo y crear nuevo registro
      // Por ahora solo actualizamos
    }

    if (dto.titulo !== undefined) documento.titulo = dto.titulo;
    if (dto.descripcion !== undefined) documento.descripcion = dto.descripcion;
    if (dto.version !== undefined) documento.version = dto.version;
    if (dto.categoria !== undefined) documento.categoria = dto.categoria;
    if (dto.archivo_url !== undefined) documento.archivoUrl = dto.archivo_url;
    if (dto.formato !== undefined) documento.formato = dto.formato;
    if (dto.tamano !== undefined) documento.tamano = dto.tamano;
    if (dto.fecha_publicacion !== undefined)
      documento.fechaPublicacion = new Date(dto.fecha_publicacion);
    if (dto.activo !== undefined) documento.activo = dto.activo;

    await this.documentoRepository.save(documento);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const documento = await this.documentoRepository.findOne({ where: { id } });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // En lugar de eliminar, marcar como inactivo (mejor práctica)
    documento.activo = false;
    await this.documentoRepository.save(documento);
  }
}
