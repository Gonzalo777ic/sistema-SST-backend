import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaAccesoDocumento } from './entities/auditoria-acceso-documento.entity';

export interface LogAccesoParams {
  usuarioId: string;
  usuarioNombre: string;
  accion: string;
  recursoTipo: string;
  recursoId: string;
  recursoDescripcion: string;
  examenId: string;
  trabajadorId: string;
  trabajadorNombre: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface LogsFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  usuarioId?: string;
  trabajadorId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditoriaAccesoDocumento)
    private readonly repo: Repository<AuditoriaAccesoDocumento>,
  ) {}

  async registrarAcceso(params: LogAccesoParams): Promise<void> {
    const log = this.repo.create({
      fechaHora: new Date(),
      usuarioId: params.usuarioId,
      usuarioNombre: params.usuarioNombre,
      accion: params.accion,
      recursoTipo: params.recursoTipo,
      recursoId: params.recursoId,
      recursoDescripcion: params.recursoDescripcion,
      examenId: params.examenId,
      trabajadorId: params.trabajadorId,
      trabajadorNombre: params.trabajadorNombre,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
    await this.repo.save(log);
  }

  async findLogs(filtros: LogsFiltros): Promise<{
    data: AuditoriaAccesoDocumento[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, filtros.page ?? 1);
    const limit = Math.min(100, Math.max(1, filtros.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('a').orderBy('a.fechaHora', 'DESC');

    if (filtros.fechaDesde) {
      qb.andWhere('a.fecha_hora >= :fechaDesde', {
        fechaDesde: new Date(filtros.fechaDesde),
      });
    }
    if (filtros.fechaHasta) {
      const hasta = new Date(filtros.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      qb.andWhere('a.fecha_hora <= :fechaHasta', { fechaHasta: hasta });
    }
    if (filtros.usuarioId) {
      qb.andWhere('a.usuario_id = :usuarioId', { usuarioId: filtros.usuarioId });
    }
    if (filtros.trabajadorId) {
      qb.andWhere('a.trabajador_id = :trabajadorId', {
        trabajadorId: filtros.trabajadorId,
      });
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exportarLogs(filtros: Omit<LogsFiltros, 'page' | 'limit'>): Promise<AuditoriaAccesoDocumento[]> {
    const { data } = await this.findLogs({ ...filtros, page: 1, limit: 10000 });
    return data;
  }
}
