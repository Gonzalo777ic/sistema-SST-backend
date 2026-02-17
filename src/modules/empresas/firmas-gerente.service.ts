import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirmaGerente } from './entities/firma-gerente.entity';
import { Empresa } from './entities/empresa.entity';
import { Usuario, UsuarioRol } from '../usuarios/entities/usuario.entity';
import { Trabajador } from '../trabajadores/entities/trabajador.entity';
import { CreateFirmaGerenteDto } from './dto/create-firma-gerente.dto';
import { UpdateFirmaGerenteDto } from './dto/update-firma-gerente.dto';
import { StorageService } from '../../common/services/storage.service';

export interface CandidatoGerente {
  tipo: 'usuario' | 'trabajador';
  id: string;
  nombre_completo: string;
  numero_documento: string;
  tipo_documento: string;
  firma_url?: string | null;
}

export interface ResponseFirmaGerenteDto {
  id: string;
  empresa_id: string;
  usuario_id: string | null;
  trabajador_id: string | null;
  nombre_completo: string;
  numero_documento: string;
  tipo_documento: string;
  rol: string;
  cargo: string;
  firma_url: string | null;
  activo: boolean;
}

@Injectable()
export class FirmasGerenteService {
  constructor(
    @InjectRepository(FirmaGerente)
    private readonly firmaGerenteRepo: Repository<FirmaGerente>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepo: Repository<Trabajador>,
    private readonly storageService: StorageService,
  ) {}

  async buscarCandidatos(empresaId: string, q: string): Promise<CandidatoGerente[]> {
    const term = q?.trim();
    if (!term || term.length < 2) return [];

    const pattern = `%${term}%`;

    const candidatos: CandidatoGerente[] = [];

    const usuarios = await this.usuarioRepo
      .createQueryBuilder('u')
      .where('u.deletedAt IS NULL')
      .andWhere(
        '(u.nombres ILIKE :term OR u.apellidoPaterno ILIKE :term OR u.apellidoMaterno ILIKE :term OR u.dni ILIKE :term)',
        { term: pattern },
      )
      .andWhere("'SUPER_ADMIN' = ANY(u.roles) OR 'ADMIN_EMPRESA' = ANY(u.roles)")
      .andWhere(
        "(u.nombres IS NOT NULL AND u.nombres != '' AND u.apellidoPaterno IS NOT NULL AND u.apellidoPaterno != '')",
      )
      .take(15)
      .getMany();

    for (const u of usuarios) {
      const nombreCompleto = [u.nombres, u.apellidoPaterno, u.apellidoMaterno]
        .filter(Boolean)
        .join(' ');
      let firmaUrl = u.firmaUrl;
      if (firmaUrl && this.storageService.isAvailable() && firmaUrl.includes('storage.googleapis.com')) {
        try {
          firmaUrl = await this.storageService.getSignedUrl(firmaUrl, 60);
        } catch {
          // mantener original
        }
      }
      candidatos.push({
        tipo: 'usuario',
        id: u.id,
        nombre_completo: nombreCompleto,
        numero_documento: u.dni,
        tipo_documento: 'DNI',
        firma_url: firmaUrl,
      });
    }

    const trabajadores = await this.trabajadorRepo
      .createQueryBuilder('t')
      .where('t.deletedAt IS NULL')
      .andWhere('t.empresaId = :empresaId', { empresaId })
      .andWhere(
        '(t.nombreCompleto ILIKE :term OR t.nombres ILIKE :term OR t.apellidoPaterno ILIKE :term OR t.apellidoMaterno ILIKE :term OR t.documentoIdentidad ILIKE :term)',
        { term: pattern },
      )
      .take(15)
      .getMany();

    for (const t of trabajadores) {
      let firmaUrl = t.firmaDigitalUrl;
      if (firmaUrl && this.storageService.isAvailable() && firmaUrl.includes('storage.googleapis.com')) {
        try {
          firmaUrl = await this.storageService.getSignedUrl(firmaUrl, 60);
        } catch {
          // mantener original
        }
      }
      candidatos.push({
        tipo: 'trabajador',
        id: t.id,
        nombre_completo: t.nombreCompleto,
        numero_documento: t.documentoIdentidad || t.numeroDocumento || '',
        tipo_documento: t.tipoDocumento || 'DNI',
        firma_url: firmaUrl,
      });
    }

    return candidatos;
  }

  async findByEmpresa(empresaId: string): Promise<ResponseFirmaGerenteDto[]> {
    const firmas = await this.firmaGerenteRepo.find({
      where: { empresaId },
      order: { createdAt: 'ASC' },
    });

    const dtos: ResponseFirmaGerenteDto[] = [];
    for (const f of firmas) {
      let firmaUrl = f.firmaUrl;
      if (firmaUrl && this.storageService.isAvailable() && firmaUrl.includes('storage.googleapis.com')) {
        try {
          firmaUrl = await this.storageService.getSignedUrl(firmaUrl, 60);
        } catch {
          // mantener original
        }
      }
      dtos.push({
        id: f.id,
        empresa_id: f.empresaId,
        usuario_id: f.usuarioId,
        trabajador_id: f.trabajadorId,
        nombre_completo: f.nombreCompleto,
        numero_documento: f.numeroDocumento,
        tipo_documento: f.tipoDocumento,
        rol: f.rol,
        cargo: f.cargo,
        firma_url: firmaUrl,
        activo: f.activo,
      });
    }
    return dtos;
  }

  /** Obtiene un gerente por ID para certificado (retorna null si no existe o está inactivo) */
  async findByIdForCertificado(id: string): Promise<{ rol: string; nombre_completo: string; cargo: string; firma_url: string | null } | null> {
    const f = await this.firmaGerenteRepo.findOne({ where: { id, activo: true } });
    if (!f) return null;
    return { rol: f.rol, nombre_completo: f.nombreCompleto, cargo: f.cargo, firma_url: f.firmaUrl };
  }

  /** Para generación de PDF: retorna gerentes activos con firma_url raw (sin firmar) */
  async findForCertificado(empresaId: string): Promise<Array<{ rol: string; nombre_completo: string; cargo: string; firma_url: string | null }>> {
    const firmas = await this.firmaGerenteRepo.find({
      where: { empresaId, activo: true },
      order: { createdAt: 'ASC' },
    });
    return firmas.map((f) => ({
      rol: f.rol,
      nombre_completo: f.nombreCompleto,
      cargo: f.cargo,
      firma_url: f.firmaUrl,
    }));
  }

  async create(dto: CreateFirmaGerenteDto): Promise<ResponseFirmaGerenteDto> {
    const empresa = await this.empresaRepo.findOne({ where: { id: dto.empresa_id } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    if (!dto.usuario_id && !dto.trabajador_id) {
      throw new BadRequestException('Debe indicar usuario_id o trabajador_id');
    }

    let firmaUrl: string | null = null;

    if (dto.firma_base64?.startsWith('data:image/')) {
      const match = dto.firma_base64.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) throw new BadRequestException('Formato de imagen inválido');
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 10 * 1024 * 1024) {
        throw new BadRequestException('La imagen de firma no debe superar 10 MB');
      }
      const ruc = empresa.ruc.replace(/[^a-zA-Z0-9]/g, '_');
      firmaUrl = await this.storageService.uploadFile(ruc, buffer, 'firma_gerente', {
        contentType: `image/${ext}`,
      });
    } else if (dto.usuario_id) {
      const usuario = await this.usuarioRepo.findOne({ where: { id: dto.usuario_id } });
      if (usuario?.firmaUrl) firmaUrl = usuario.firmaUrl;
    } else if (dto.trabajador_id) {
      const trabajador = await this.trabajadorRepo.findOne({ where: { id: dto.trabajador_id } });
      if (trabajador?.firmaDigitalUrl) firmaUrl = trabajador.firmaDigitalUrl;
    }

    const existente = await this.firmaGerenteRepo.findOne({
      where: {
        empresaId: dto.empresa_id,
        activo: true,
        ...(dto.usuario_id ? { usuarioId: dto.usuario_id } : { trabajadorId: dto.trabajador_id! }),
      },
    });
    if (existente) {
      throw new BadRequestException('Este usuario/trabajador ya está registrado como gerente activo en esta empresa');
    }

    const firma = this.firmaGerenteRepo.create({
      empresaId: dto.empresa_id,
      usuarioId: dto.usuario_id ?? null,
      trabajadorId: dto.trabajador_id ?? null,
      nombreCompleto: dto.nombre_completo,
      numeroDocumento: dto.numero_documento,
      tipoDocumento: dto.tipo_documento || 'DNI',
      rol: dto.rol,
      cargo: dto.cargo,
      firmaUrl: firmaUrl || null,
    });

    const saved = await this.firmaGerenteRepo.save(firma);
    return this.toDto(saved);
  }

  async update(id: string, dto: UpdateFirmaGerenteDto): Promise<ResponseFirmaGerenteDto> {
    const firma = await this.firmaGerenteRepo.findOne({ where: { id }, relations: ['empresa'] });
    if (!firma) throw new NotFoundException('Firma de gerente no encontrada');

    if (dto.rol !== undefined) firma.rol = dto.rol;
    if (dto.cargo !== undefined) firma.cargo = dto.cargo;

    if (dto.firma_base64?.startsWith('data:image/')) {
      const match = dto.firma_base64.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) throw new BadRequestException('Formato de imagen inválido');
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 10 * 1024 * 1024) {
        throw new BadRequestException('La imagen de firma no debe superar 10 MB');
      }
      const empresa = firma.empresa as Empresa;
      const ruc = empresa.ruc.replace(/[^a-zA-Z0-9]/g, '_');
      firma.firmaUrl = await this.storageService.uploadFile(ruc, buffer, 'firma_gerente', {
        contentType: `image/${ext}`,
      });
    }

    const saved = await this.firmaGerenteRepo.save(firma);
    return this.toDto(saved);
  }

  async desactivar(id: string): Promise<ResponseFirmaGerenteDto> {
    const firma = await this.firmaGerenteRepo.findOne({ where: { id } });
    if (!firma) throw new NotFoundException('Firma de gerente no encontrada');
    firma.activo = false;
    const saved = await this.firmaGerenteRepo.save(firma);
    return this.toDto(saved);
  }

  async reactivar(id: string): Promise<ResponseFirmaGerenteDto> {
    const firma = await this.firmaGerenteRepo.findOne({ where: { id } });
    if (!firma) throw new NotFoundException('Firma de gerente no encontrada');
    firma.activo = true;
    const saved = await this.firmaGerenteRepo.save(firma);
    return this.toDto(saved);
  }

  private async toDto(f: FirmaGerente): Promise<ResponseFirmaGerenteDto> {
    let firmaUrl = f.firmaUrl;
    if (firmaUrl && this.storageService.isAvailable() && firmaUrl.includes('storage.googleapis.com')) {
      try {
        firmaUrl = await this.storageService.getSignedUrl(firmaUrl, 60);
      } catch {
        // mantener original
      }
    }
    return {
      id: f.id,
      empresa_id: f.empresaId,
      usuario_id: f.usuarioId,
      trabajador_id: f.trabajadorId,
      nombre_completo: f.nombreCompleto,
      numero_documento: f.numeroDocumento,
      tipo_documento: f.tipoDocumento,
      rol: f.rol,
      cargo: f.cargo,
      firma_url: firmaUrl,
      activo: f.activo,
    };
  }
}
