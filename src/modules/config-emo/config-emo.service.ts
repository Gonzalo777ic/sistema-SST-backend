import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilEmo } from './entities/perfil-emo.entity';
import { CentroMedico } from './entities/centro-medico.entity';
import { ResultadoAdicionalEmo } from './entities/resultado-adicional-emo.entity';
import { ConfigEmo } from './entities/config-emo.entity';
import { EmoDiferido } from './entities/emo-diferido.entity';
import { CreatePerfilEmoDto } from './dto/create-perfil-emo.dto';
import { CreateCentroMedicoDto } from './dto/create-centro-medico.dto';
import { CreateResultadoAdicionalDto } from './dto/create-resultado-adicional.dto';
import { ResponsePerfilEmoDto } from './dto/response-perfil-emo.dto';
import { ResponseCentroMedicoDto } from './dto/response-centro-medico.dto';
import { ResponseResultadoAdicionalDto } from './dto/response-resultado-adicional.dto';
import { ResponseEmoDiferidoDto } from './dto/response-emo-diferido.dto';
import { StorageService } from '../../common/services/storage.service';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class ConfigEmoService {
  constructor(
    @InjectRepository(PerfilEmo)
    private readonly perfilRepo: Repository<PerfilEmo>,
    @InjectRepository(CentroMedico)
    private readonly centroRepo: Repository<CentroMedico>,
    @InjectRepository(ResultadoAdicionalEmo)
    private readonly resultadoRepo: Repository<ResultadoAdicionalEmo>,
    @InjectRepository(ConfigEmo)
    private readonly configRepo: Repository<ConfigEmo>,
    @InjectRepository(EmoDiferido)
    private readonly diferidoRepo: Repository<EmoDiferido>,
    private readonly storageService: StorageService,
    private readonly usuariosService: UsuariosService,
  ) {}

  private async getUsuarioNombre(usuarioId: string): Promise<string> {
    const usuario = await this.usuariosService.findById(usuarioId);
    if (!usuario) return 'Sistema';
    const trabajador = usuario.trabajador as { nombreCompleto?: string } | undefined;
    if (trabajador?.nombreCompleto) return trabajador.nombreCompleto;
    const parts = [usuario.nombres, usuario.apellidoPaterno, usuario.apellidoMaterno].filter(Boolean);
    return parts.join(' ') || usuario.dni || 'Sistema';
  }

  async findAllPerfiles(): Promise<ResponsePerfilEmoDto[]> {
    const perfiles = await this.perfilRepo.find({
      order: { createdAt: 'DESC' },
    });
    return perfiles.map((p, i) => ({
      id: p.id,
      fecha_registro: p.createdAt.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      nombre: p.nombre,
      registrado_por: p.registradoPorNombre,
    }));
  }

  async createPerfil(dto: CreatePerfilEmoDto, usuarioId: string): Promise<ResponsePerfilEmoDto> {
    const nombreUsuario = await this.getUsuarioNombre(usuarioId);
    const perfil = this.perfilRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      costoUnitario: Number(dto.costo_unitario),
      registradoPorId: usuarioId,
      registradoPorNombre: nombreUsuario,
    });
    const saved = await this.perfilRepo.save(perfil);
    return {
      id: saved.id,
      fecha_registro: saved.createdAt.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      nombre: saved.nombre,
      registrado_por: saved.registradoPorNombre,
    };
  }

  async findOnePerfil(id: string): Promise<{
    id: string;
    nombre: string;
    descripcion: string | null;
    costoUnitario: number;
    registradoPorNombre: string;
  }> {
    const perfil = await this.perfilRepo.findOne({ where: { id } });
    if (!perfil) throw new NotFoundException('Perfil EMO no encontrado');
    return {
      id: perfil.id,
      nombre: perfil.nombre,
      descripcion: perfil.descripcion,
      costoUnitario: Number(perfil.costoUnitario),
      registradoPorNombre: perfil.registradoPorNombre,
    };
  }

  async updatePerfil(
    id: string,
    dto: { nombre?: string; descripcion?: string; costo_unitario?: number },
  ): Promise<ResponsePerfilEmoDto> {
    const perfil = await this.perfilRepo.findOne({ where: { id } });
    if (!perfil) throw new NotFoundException('Perfil EMO no encontrado');
    if (dto.nombre !== undefined) perfil.nombre = dto.nombre;
    if (dto.descripcion !== undefined) perfil.descripcion = dto.descripcion;
    if (dto.costo_unitario !== undefined) perfil.costoUnitario = Number(dto.costo_unitario);
    const saved = await this.perfilRepo.save(perfil);
    return {
      id: saved.id,
      fecha_registro: saved.createdAt.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      nombre: saved.nombre,
      registrado_por: saved.registradoPorNombre,
    };
  }

  async findAllCentros(): Promise<ResponseCentroMedicoDto[]> {
    const centros = await this.centroRepo.find({
      order: { createdAt: 'DESC' },
    });
    return centros.map((c) => ({
      id: c.id,
      fecha_registro: c.createdAt.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      centro_medico: c.nombre,
      direccion: c.direccion,
      archivo_pdf_url: c.archivoPdfUrl,
    }));
  }

  async createCentro(dto: CreateCentroMedicoDto): Promise<ResponseCentroMedicoDto> {
    let archivoPdfUrl: string | null = null;
    if (dto.archivo_pdf_base64?.startsWith('data:application/pdf')) {
      const match = dto.archivo_pdf_base64.match(/^data:application\/pdf;base64,(.+)$/);
      if (match) {
        const buffer = Buffer.from(match[1], 'base64');
        if (buffer.length > 10 * 1024 * 1024) {
          throw new BadRequestException('El PDF no debe superar 10 MB');
        }
        archivoPdfUrl = await this.storageService.uploadFile(
          'sistema',
          buffer,
          'centro_medico_pdf',
          { contentType: 'application/pdf' },
        );
      }
    }
    const centro = this.centroRepo.create({
      nombre: dto.nombre,
      direccion: dto.direccion ?? null,
      archivoPdfUrl,
    });
    const saved = await this.centroRepo.save(centro);
    return {
      id: saved.id,
      fecha_registro: saved.createdAt.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      centro_medico: saved.nombre,
      direccion: saved.direccion,
      archivo_pdf_url: saved.archivoPdfUrl,
    };
  }

  async updateCentro(
    id: string,
    dto: Partial<CreateCentroMedicoDto>,
  ): Promise<ResponseCentroMedicoDto> {
    const centro = await this.centroRepo.findOne({ where: { id } });
    if (!centro) throw new NotFoundException('Centro médico no encontrado');
    if (dto.nombre !== undefined) centro.nombre = dto.nombre;
    if (dto.direccion !== undefined) centro.direccion = dto.direccion;
    if (dto.archivo_pdf_base64?.startsWith('data:application/pdf')) {
      const match = dto.archivo_pdf_base64.match(/^data:application\/pdf;base64,(.+)$/);
      if (match) {
        const buffer = Buffer.from(match[1], 'base64');
        if (buffer.length > 10 * 1024 * 1024) {
          throw new BadRequestException('El PDF no debe superar 10 MB');
        }
        centro.archivoPdfUrl = await this.storageService.uploadFile(
          'sistema',
          buffer,
          'centro_medico_pdf',
          { contentType: 'application/pdf' },
        );
      }
    }
    const saved = await this.centroRepo.save(centro);
    return {
      id: saved.id,
      fecha_registro: saved.createdAt.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      centro_medico: saved.nombre,
      direccion: saved.direccion,
      archivo_pdf_url: saved.archivoPdfUrl,
    };
  }

  async softDeleteCentro(id: string): Promise<void> {
    const centro = await this.centroRepo.findOne({ where: { id } });
    if (!centro) throw new NotFoundException('Centro médico no encontrado');
    await this.centroRepo.softDelete(id);
  }

  async findAllResultados(): Promise<ResponseResultadoAdicionalDto[]> {
    const resultados = await this.resultadoRepo.find({
      order: { nombre: 'ASC' },
    });
    return resultados.map((r) => ({ id: r.id, nombre: r.nombre }));
  }

  async createResultado(dto: CreateResultadoAdicionalDto): Promise<ResponseResultadoAdicionalDto> {
    const resultado = this.resultadoRepo.create({ nombre: dto.nombre.trim() });
    const saved = await this.resultadoRepo.save(resultado);
    return { id: saved.id, nombre: saved.nombre };
  }

  async updateResultado(
    id: string,
    dto: CreateResultadoAdicionalDto,
  ): Promise<ResponseResultadoAdicionalDto> {
    const resultado = await this.resultadoRepo.findOne({ where: { id } });
    if (!resultado) throw new NotFoundException('Resultado adicional no encontrado');
    resultado.nombre = dto.nombre.trim();
    const saved = await this.resultadoRepo.save(resultado);
    return { id: saved.id, nombre: saved.nombre };
  }

  async softDeleteResultado(id: string): Promise<void> {
    const resultado = await this.resultadoRepo.findOne({ where: { id } });
    if (!resultado) throw new NotFoundException('Resultado adicional no encontrado');
    await this.resultadoRepo.softDelete(id);
  }

  async getRecomendaciones(): Promise<string> {
    const config = await this.configRepo.findOne({ where: {} });
    return config?.recomendacionesColaborador ?? '';
  }

  async updateRecomendaciones(texto: string): Promise<string> {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create({ recomendacionesColaborador: texto });
    } else {
      config.recomendacionesColaborador = texto;
    }
    await this.configRepo.save(config);
    return config.recomendacionesColaborador ?? '';
  }

  async findAllDiferidos(q?: string): Promise<ResponseEmoDiferidoDto[]> {
    const qb = this.diferidoRepo
      .createQueryBuilder('e')
      .where('e.deletedAt IS NULL')
      .orderBy('e.createdAt', 'DESC');
    if (q?.trim()) {
      const term = `%${q.trim()}%`;
      qb.andWhere(
        '(e.nombreApellido ILIKE :term OR e.numeroDocumento ILIKE :term)',
        { term },
      );
    }
    const items = await qb.getMany();
    return items.map((e) => ({
      id: e.id,
      nombre_apellido: e.nombreApellido,
      tipo_documento: e.tipoDocumento,
      numero_documento: e.numeroDocumento,
    }));
  }
}
