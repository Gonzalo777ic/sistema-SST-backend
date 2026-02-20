import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import {
  UsuarioCentroMedico,
  EstadoParticipacion,
} from './entities/usuario-centro-medico.entity';
import { CentroMedico } from '../config-emo/entities/centro-medico.entity';
import { CreateParticipacionDto } from './dto/create-participacion.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';

export interface ParticipacionInfo {
  id: string;
  centroMedicoId: string;
  centroMedicoNombre: string;
  estado: EstadoParticipacion;
  fechaInicio: string;
  fechaFin: string | null;
}

export interface ParticipacionConUsuarioInfo extends ParticipacionInfo {
  usuarioId: string;
  usuarioDni: string;
}

function toDateStr(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v.split('T')[0];
  return v.toISOString().split('T')[0];
}

@Injectable()
export class UsuarioCentroMedicoService {
  constructor(
    @InjectRepository(UsuarioCentroMedico)
    private readonly repo: Repository<UsuarioCentroMedico>,
    @InjectRepository(CentroMedico)
    private readonly centroRepo: Repository<CentroMedico>,
    private readonly usuariosService: UsuariosService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene los IDs de centros médicos donde el usuario tiene participación activa.
   * Incluye fallback a centroMedicoId legado si no hay participaciones.
   */
  async getCentrosActivosPorUsuario(
    usuarioId: string,
    centroMedicoIdLegado?: string | null,
  ): Promise<string[]> {
    const participaciones = await this.repo.find({
      where: {
        usuarioId,
        estado: EstadoParticipacion.ACTIVO,
      },
      relations: ['centroMedico'],
    });
    const ids = participaciones
      .filter((p) => !p.deletedAt)
      .map((p) => p.centroMedicoId);

    if (ids.length > 0) return ids;
    if (centroMedicoIdLegado) return [centroMedicoIdLegado];
    return [];
  }

  /**
   * Verifica si el usuario tiene acceso activo a al menos un centro médico.
   */
  async tieneAccesoCentro(
    usuarioId: string,
    centroMedicoIdLegado?: string | null,
  ): Promise<boolean> {
    const centros = await this.getCentrosActivosPorUsuario(
      usuarioId,
      centroMedicoIdLegado,
    );
    return centros.length > 0;
  }

  /**
   * Crea una participación activa. Usado al vincular usuario a centro.
   */
  async addParticipacion(
    dto: CreateParticipacionDto,
    manager?: EntityManager,
  ): Promise<UsuarioCentroMedico> {
    const r = manager ? manager.getRepository(UsuarioCentroMedico) : this.repo;
    const centro = await (manager
      ? manager.getRepository(CentroMedico)
      : this.centroRepo
    ).findOne({ where: { id: dto.centro_medico_id } });
    if (!centro) {
      throw new NotFoundException('Centro médico no encontrado');
    }

    const existente = await r.findOne({
      where: {
        usuarioId: dto.usuario_id,
        centroMedicoId: dto.centro_medico_id,
      },
      withDeleted: true,
    });
    if (existente) {
      if (!existente.deletedAt && existente.estado === EstadoParticipacion.ACTIVO) {
        throw new ConflictException(
          'El usuario ya tiene una participación activa en este centro médico',
        );
      }
      if (!existente.deletedAt && existente.estado !== EstadoParticipacion.ACTIVO) {
        existente.estado = EstadoParticipacion.ACTIVO;
        existente.fechaFin = null;
        return r.save(existente);
      }
      if (existente.deletedAt) {
        const restored = await r.recover(existente);
        restored.estado = EstadoParticipacion.ACTIVO;
        restored.fechaInicio = dto.fecha_inicio
          ? new Date(dto.fecha_inicio)
          : new Date();
        restored.fechaFin = null;
        return r.save(restored);
      }
    }

    const participacion = r.create({
      usuarioId: dto.usuario_id,
      centroMedicoId: dto.centro_medico_id,
      estado: EstadoParticipacion.ACTIVO,
      fechaInicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : new Date(),
      fechaFin: null,
    });
    return r.save(participacion);
  }

  /**
   * Agrega un usuario a un centro médico (página Usuarios Centro Médico).
   * Si el usuario no existe, lo crea con rol CENTRO_MEDICO y crea la participación.
   * Si existe, crea la participación (y añade rol CENTRO_MEDICO si no lo tiene).
   */
  async agregarUsuarioACentro(
    dni: string,
    centroMedicoId: string,
  ): Promise<{ usuarioId: string; participacionId: string }> {
    const centro = await this.centroRepo.findOne({
      where: { id: centroMedicoId },
    });
    if (!centro) {
      throw new NotFoundException('Centro médico no encontrado');
    }

    let usuario = await this.usuariosService.findByDni(dni);
    if (!usuario) {
      return this.dataSource.transaction(async (manager) => {
        const nuevoUsuario = await this.usuariosService.createForCentroMedico(
          { dni, password: dni },
          manager,
        );
        const participacion = await this.addParticipacion(
          {
            usuario_id: nuevoUsuario.id,
            centro_medico_id: centroMedicoId,
          },
          manager,
        );
        return {
          usuarioId: nuevoUsuario.id,
          participacionId: participacion.id,
        };
      });
    }

    if (!usuario.roles.includes(UsuarioRol.CENTRO_MEDICO)) {
      await this.usuariosService.update(usuario.id, {
        roles: [...usuario.roles, UsuarioRol.CENTRO_MEDICO],
      });
    }

    const participacion = await this.addParticipacion({
      usuario_id: usuario.id,
      centro_medico_id: centroMedicoId,
    });
    return {
      usuarioId: usuario.id,
      participacionId: participacion.id,
    };
  }

  /**
   * Crea participación en transacción. Usado al crear centro + usuario.
   */
  async addParticipacionForCentroMedico(
    usuarioId: string,
    centroMedicoId: string,
    manager?: EntityManager,
  ): Promise<UsuarioCentroMedico> {
    return this.addParticipacion(
      {
        usuario_id: usuarioId,
        centro_medico_id: centroMedicoId,
        fecha_inicio: new Date().toISOString().split('T')[0],
      },
      manager,
    );
  }

  /**
   * Revoca la participación (soft delete + estado revocado).
   * Operación reversible.
   */
  async revocarParticipacion(id: string): Promise<void> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Participación no encontrada');
    p.estado = EstadoParticipacion.REVOCADO;
    p.fechaFin = new Date();
    await this.repo.save(p);
    await this.repo.softDelete(id);
  }

  /**
   * Vincula un usuario a un registro UsuarioCentroMedico existente.
   * El usuario es la llave, el registro es la identidad. No crea participación.
   * Si el registro estaba revocado (soft-deleted), lo recupera y activa.
   */
  async vincularUsuarioARegistro(
    participacionId: string,
    usuarioId: string,
  ): Promise<UsuarioCentroMedico> {
    const p = await this.repo.findOne({
      where: { id: participacionId },
      relations: ['centroMedico'],
      withDeleted: true,
    });
    if (!p) throw new NotFoundException('Registro usuario centro médico no encontrado');
    await this.usuariosService.findOne(usuarioId);
    const toSave = p.deletedAt ? await this.repo.recover(p) : p;
    toSave.usuarioId = usuarioId;
    toSave.estado = EstadoParticipacion.ACTIVO;
    toSave.fechaFin = null;
    return this.repo.save(toSave);
  }

  /**
   * Reactiva una participación previamente revocada.
   */
  async reactivarParticipacion(id: string): Promise<UsuarioCentroMedico> {
    const p = await this.repo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!p) throw new NotFoundException('Participación no encontrada');
    const restored = await this.repo.recover(p);
    restored.estado = EstadoParticipacion.ACTIVO;
    restored.fechaFin = null;
    return this.repo.save(restored);
  }

  /**
   * Lista participaciones de un usuario (activas e históricas, excluyendo soft-deleted).
   */
  async findByUsuario(usuarioId: string): Promise<ParticipacionInfo[]> {
    const items = await this.repo.find({
      where: { usuarioId },
      relations: ['centroMedico'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });
    return items
      .filter((i) => !i.deletedAt)
      .map((i) => ({
        id: i.id,
        centroMedicoId: i.centroMedicoId,
        centroMedicoNombre: i.centroMedico?.nombre ?? '',
        estado: i.estado,
        fechaInicio: toDateStr(i.fechaInicio) ?? '',
        fechaFin: toDateStr(i.fechaFin),
      }));
  }

  /**
   * Lista todas las participaciones de un usuario incluyendo revocadas (soft-deleted).
   * Útil para la UI de reactivación.
   */
  async findByUsuarioIncluyendoRevocadas(
    usuarioId: string,
  ): Promise<ParticipacionInfo[]> {
    const items = await this.repo.find({
      where: { usuarioId },
      relations: ['centroMedico'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });
    return items.map((i) => ({
      id: i.id,
      centroMedicoId: i.centroMedicoId,
      centroMedicoNombre: i.centroMedico?.nombre ?? '',
      estado: i.estado,
      fechaInicio: toDateStr(i.fechaInicio) ?? '',
      fechaFin: toDateStr(i.fechaFin),
    }));
  }

  /**
   * Lista todas las participaciones agrupadas por centro (para página Usuarios Centro Médico).
   */
  async findAllAgrupadasPorCentro(): Promise<
    Array<{
      centroId: string;
      centroNombre: string;
      participaciones: ParticipacionConUsuarioInfo[];
    }>
  > {
    const centros = await this.centroRepo.find({
      order: { nombre: 'ASC' },
    });
    const result: Array<{
      centroId: string;
      centroNombre: string;
      participaciones: ParticipacionConUsuarioInfo[];
    }> = [];
    for (const c of centros) {
      const participaciones = await this.findByCentro(c.id);
      result.push({
        centroId: c.id,
        centroNombre: c.nombre,
        participaciones,
      });
    }
    return result;
  }

  /**
   * Lista participaciones por centro médico (para página Usuarios Centro Médico).
   * Incluye activas, inactivas y revocadas (soft-deleted). El registro existe aunque esté desvinculado.
   */
  async findByCentro(
    centroMedicoId: string,
  ): Promise<ParticipacionConUsuarioInfo[]> {
    const items = await this.repo.find({
      where: { centroMedicoId },
      relations: ['usuario', 'centroMedico'],
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });
    return items.map((i) => ({
        id: i.id,
        centroMedicoId: i.centroMedicoId,
        centroMedicoNombre: i.centroMedico?.nombre ?? '',
        estado: i.estado,
        fechaInicio: toDateStr(i.fechaInicio) ?? '',
        fechaFin: toDateStr(i.fechaFin),
        usuarioId: i.usuarioId,
        usuarioDni: (i.usuario as any)?.dni ?? '',
      }));
  }

  /**
   * Desactiva una participación (estado INACTIVO). Reversible.
   * No hace soft delete.
   */
  async desactivarParticipacion(id: string): Promise<UsuarioCentroMedico> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Participación no encontrada');
    p.estado = EstadoParticipacion.INACTIVO;
    p.fechaFin = new Date();
    return this.repo.save(p);
  }

  /**
   * Activa una participación (estado ACTIVO).
   * Si estaba revocada (soft-deleted), la recupera primero.
   */
  async activarParticipacion(id: string): Promise<UsuarioCentroMedico> {
    const p = await this.repo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!p) throw new NotFoundException('Participación no encontrada');
    const toSave = p.deletedAt ? await this.repo.recover(p) : p;
    toSave.estado = EstadoParticipacion.ACTIVO;
    toSave.fechaFin = null;
    return this.repo.save(toSave);
  }

  /**
   * Desvincula usuario de un centro (revoca participación activa).
   */
  async desvincularDeCentro(
    usuarioId: string,
    centroMedicoId: string,
  ): Promise<void> {
    const p = await this.repo.findOne({
      where: {
        usuarioId,
        centroMedicoId,
        estado: EstadoParticipacion.ACTIVO,
      },
    });
    if (!p) {
      throw new BadRequestException(
        'No existe una participación activa del usuario en este centro médico',
      );
    }
    await this.revocarParticipacion(p.id);
  }
}
