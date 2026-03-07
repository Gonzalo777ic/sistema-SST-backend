import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MarcoNormativo } from './entities/marco-normativo.entity';
import { DocumentoNormativo } from './entities/documento-normativo.entity';
import { EmpresaMarcoNormativo } from './entities/empresa-marco-normativo.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CreateMarcoNormativoDto } from './dto/create-marco-normativo.dto';
import { UpdateMarcoNormativoDto } from './dto/update-marco-normativo.dto';
import { CreateDocumentoNormativoDto } from './dto/create-documento-normativo.dto';
import { ResponseMarcoNormativoDto } from './dto/response-marco-normativo.dto';
import { StorageService } from '../../common/services/storage.service';

const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const MARCOS_PREDETERMINADOS = [
  'Comité - Reglamento de Seguridad y Salud en el Trabajo',
  'Comité - Reglamento de Seguridad y Salud Ocupacional en Minería',
  'Comité - Reglamento de Seguridad y Salud Ocupacional para el Sector Construcción',
  'Guía de Seguridad y Salud en el Trabajo para el sector agrario',
];

@Injectable()
export class MarcosNormativosService {
  constructor(
    @InjectRepository(MarcoNormativo)
    private readonly marcoRepo: Repository<MarcoNormativo>,
    @InjectRepository(DocumentoNormativo)
    private readonly documentoRepo: Repository<DocumentoNormativo>,
    @InjectRepository(EmpresaMarcoNormativo)
    private readonly pivotRepo: Repository<EmpresaMarcoNormativo>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    private readonly storageService: StorageService,
  ) {}

  /** Marcos vinculados a una empresa (vía tabla pivote) */
  async findAll(empresaId?: string): Promise<ResponseMarcoNormativoDto[]> {
    if (!empresaId) {
      const marcos = await this.marcoRepo.find({
        relations: ['documentos'],
        order: { nombre: 'ASC' },
        withDeleted: false,
      });
      return this.enrichWithEmpresasVinculadas(marcos);
    }

    const pivotRows = await this.pivotRepo.find({
      where: { empresaId },
      relations: ['marcoNormativo', 'marcoNormativo.documentos'],
    });
    const marcos = pivotRows
      .map((p) => p.marcoNormativo)
      .filter(Boolean)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    return this.enrichWithEmpresasVinculadas(marcos);
  }

  /** Marcos activos vinculados a una empresa */
  async findAllActivos(empresaId: string): Promise<ResponseMarcoNormativoDto[]> {
    const pivotRows = await this.pivotRepo.find({
      where: { empresaId },
      relations: ['marcoNormativo', 'marcoNormativo.documentos'],
    });
    const marcos = pivotRows
      .map((p) => p.marcoNormativo)
      .filter((m) => m && m.activo)
      .sort((a, b) => a!.nombre.localeCompare(b!.nombre));
    return this.enrichWithEmpresasVinculadas(marcos as MarcoNormativo[]);
  }

  /** Marcos que la empresa aún NO tiene vinculados (para reutilizar) */
  async findAllDisponiblesParaVincular(empresaId: string): Promise<ResponseMarcoNormativoDto[]> {
    const yaVinculados = await this.pivotRepo.find({
      where: { empresaId },
      select: ['marcoNormativoId'],
    });
    const idsYaVinculados = new Set(yaVinculados.map((p) => p.marcoNormativoId));

    const todos = await this.marcoRepo.find({
      relations: ['documentos'],
      order: { nombre: 'ASC' },
      withDeleted: false,
    });
    const noVinculados = todos.filter((m) => !idsYaVinculados.has(m.id));
    return this.enrichWithEmpresasVinculadas(noVinculados);
  }

  private async enrichWithEmpresasVinculadas(
    marcos: MarcoNormativo[],
  ): Promise<ResponseMarcoNormativoDto[]> {
    const result: ResponseMarcoNormativoDto[] = [];
    for (const marco of marcos) {
      const pivotes = await this.pivotRepo.find({
        where: { marcoNormativoId: marco.id },
        select: ['empresaId'],
      });
      const dto = ResponseMarcoNormativoDto.fromEntity({
        ...marco,
        empresasVinculadas: pivotes.map((p) => p.empresaId),
      });
      result.push(dto);
    }
    return result;
  }

  async findOne(id: string): Promise<ResponseMarcoNormativoDto> {
    const marco = await this.marcoRepo.findOne({
      where: { id },
      relations: ['documentos'],
      withDeleted: false,
    });
    if (!marco) {
      throw new NotFoundException(`Marco normativo con ID ${id} no encontrado`);
    }
    const [dto] = await this.enrichWithEmpresasVinculadas([marco]);
    return dto;
  }

  async create(dto: CreateMarcoNormativoDto): Promise<ResponseMarcoNormativoDto> {
    const empresa = await this.empresaRepo.findOne({
      where: { id: dto.empresa_id },
    });
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${dto.empresa_id} no encontrada`);
    }

    const marco = this.marcoRepo.create({
      empresaPropietariaId: dto.empresa_id,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      activo: dto.activo ?? true,
    });

    const saved = await this.marcoRepo.save(marco);

    await this.pivotRepo.save(
      this.pivotRepo.create({
        empresaId: dto.empresa_id,
        marcoNormativoId: saved.id,
      }),
    );

    return this.findOne(saved.id);
  }

  async update(
    id: string,
    dto: UpdateMarcoNormativoDto,
  ): Promise<ResponseMarcoNormativoDto> {
    const marco = await this.marcoRepo.findOne({
      where: { id },
      withDeleted: false,
    });
    if (!marco) {
      throw new NotFoundException(`Marco normativo con ID ${id} no encontrado`);
    }

    if (dto.nombre !== undefined) marco.nombre = dto.nombre;
    if (dto.descripcion !== undefined) marco.descripcion = dto.descripcion;
    if (dto.activo !== undefined) marco.activo = dto.activo;

    await this.marcoRepo.save(marco);
    return this.findOne(id);
  }

  async softRemove(id: string): Promise<void> {
    const marco = await this.marcoRepo.findOne({
      where: { id },
      withDeleted: false,
    });
    if (!marco) {
      throw new NotFoundException(`Marco normativo con ID ${id} no encontrado`);
    }
    await this.pivotRepo.delete({ marcoNormativoId: id });
    await this.marcoRepo.softRemove(marco);
  }

  /** Vincula un marco existente a una empresa (reutilizar) */
  async vincularEmpresa(marcoId: string, empresaId: string): Promise<ResponseMarcoNormativoDto> {
    const marco = await this.marcoRepo.findOne({
      where: { id: marcoId },
      withDeleted: false,
    });
    if (!marco) {
      throw new NotFoundException(`Marco normativo con ID ${marcoId} no encontrado`);
    }

    const empresa = await this.empresaRepo.findOne({
      where: { id: empresaId },
    });
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
    }

    const existente = await this.pivotRepo.findOne({
      where: { marcoNormativoId: marcoId, empresaId },
    });
    if (existente) {
      throw new ConflictException('La empresa ya tiene vinculado este marco normativo');
    }

    await this.pivotRepo.save(
      this.pivotRepo.create({
        empresaId,
        marcoNormativoId: marcoId,
      }),
    );

    return this.findOne(marcoId);
  }

  /** Desvincula un marco de una empresa */
  async desvincularEmpresa(marcoId: string, empresaId: string): Promise<void> {
    const marco = await this.marcoRepo.findOne({
      where: { id: marcoId },
      withDeleted: false,
    });
    if (!marco) {
      throw new NotFoundException(`Marco normativo con ID ${marcoId} no encontrado`);
    }

    const pivot = await this.pivotRepo.findOne({
      where: { marcoNormativoId: marcoId, empresaId },
    });
    if (!pivot) {
      throw new NotFoundException('La empresa no tiene vinculado este marco');
    }

    const count = await this.pivotRepo.count({ where: { marcoNormativoId: marcoId } });
    if (count <= 1) {
      throw new BadRequestException(
        'No se puede desvincular. El marco debe estar vinculado al menos a una empresa.',
      );
    }

    await this.pivotRepo.remove(pivot);
  }

  async agregarDocumento(
    marcoId: string,
    dto: CreateDocumentoNormativoDto,
  ): Promise<ResponseMarcoNormativoDto> {
    const marco = await this.marcoRepo.findOne({
      where: { id: marcoId },
      withDeleted: false,
    });
    if (!marco) {
      throw new NotFoundException(`Marco normativo con ID ${marcoId} no encontrado`);
    }

    const doc = this.documentoRepo.create({
      marcoNormativoId: marcoId,
      nombre: dto.nombre,
      archivoUrl: dto.archivo_url,
      version: dto.version ?? null,
    });

    await this.documentoRepo.save(doc);
    return this.findOne(marcoId);
  }

  async uploadDocumento(
    marcoId: string,
    file: Express.Multer.File,
    nombre: string,
    empresaIdForRuc?: string,
  ): Promise<ResponseMarcoNormativoDto> {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `El archivo no debe superar ${MAX_FILE_SIZE_MB} MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      );
    }

    const marco = await this.marcoRepo.findOne({
      where: { id: marcoId },
      relations: ['empresaPropietaria'],
      withDeleted: false,
    });
    if (!marco) {
      throw new NotFoundException(`Marco normativo con ID ${marcoId} no encontrado`);
    }

    let ruc = 'default';
    if (marco.empresaPropietariaId) {
      const emp = await this.empresaRepo.findOne({
        where: { id: marco.empresaPropietariaId },
      });
      if (emp) ruc = emp.ruc;
    } else if (empresaIdForRuc) {
      const emp = await this.empresaRepo.findOne({
        where: { id: empresaIdForRuc },
      });
      if (emp) ruc = emp.ruc;
    }

    const url = await this.storageService.uploadFile(
      ruc,
      file.buffer,
      'documento_normativo',
      { contentType: 'application/pdf' },
    );

    const doc = this.documentoRepo.create({
      marcoNormativoId: marcoId,
      nombre: nombre || file.originalname || 'Documento',
      archivoUrl: url,
      version: null,
      activo: true,
    });

    await this.documentoRepo.save(doc);
    return this.findOne(marcoId);
  }

  /** Genera URL firmada para ver un documento en bucket privado */
  async getSignedUrlDocumento(documentoId: string): Promise<{ url: string }> {
    const doc = await this.documentoRepo.findOne({
      where: { id: documentoId },
    });
    if (!doc) {
      throw new NotFoundException(`Documento con ID ${documentoId} no encontrado`);
    }
    const signedUrl = await this.storageService.getSignedUrl(doc.archivoUrl, 10);
    return { url: signedUrl };
  }

  /** Desactiva un documento (no se elimina, solo queda inactivo/opaco) */
  async desactivarDocumento(documentoId: string): Promise<void> {
    const doc = await this.documentoRepo.findOne({
      where: { id: documentoId },
    });
    if (!doc) {
      throw new NotFoundException(`Documento con ID ${documentoId} no encontrado`);
    }
    await this.documentoRepo.update(documentoId, { activo: false });
  }

  /** Reactiva un documento desactivado */
  async activarDocumento(documentoId: string): Promise<void> {
    const doc = await this.documentoRepo.findOne({
      where: { id: documentoId },
    });
    if (!doc) {
      throw new NotFoundException(`Documento con ID ${documentoId} no encontrado`);
    }
    await this.documentoRepo.update(documentoId, { activo: true });
  }

  async crearMarcosPredeterminados(empresaId: string): Promise<ResponseMarcoNormativoDto[]> {
    const empresa = await this.empresaRepo.findOne({
      where: { id: empresaId },
    });
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
    }

    const creados: ResponseMarcoNormativoDto[] = [];

    for (const nombre of MARCOS_PREDETERMINADOS) {
      let marco = await this.marcoRepo.findOne({
        where: { nombre },
        withDeleted: false,
      });

      if (!marco) {
        marco = this.marcoRepo.create({
          empresaPropietariaId: null,
          nombre,
          descripcion: null,
          activo: true,
        });
        marco = await this.marcoRepo.save(marco);
      }

      const yaVinculado = await this.pivotRepo.findOne({
        where: { marcoNormativoId: marco.id, empresaId },
      });
      if (!yaVinculado) {
        await this.pivotRepo.save(
          this.pivotRepo.create({
            empresaId,
            marcoNormativoId: marco.id,
          }),
        );
      }

      creados.push(await this.findOne(marco.id));
    }

    return creados;
  }
}
