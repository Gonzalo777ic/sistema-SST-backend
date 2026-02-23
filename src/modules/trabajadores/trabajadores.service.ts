import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trabajador, EstadoTrabajador, TipoDocumento } from './entities/trabajador.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto, UpdatePersonalDataDto, UpdateMedicoPersonalDataDto } from './dto/update-trabajador.dto';
import { ResponseTrabajadorDto } from './dto/response-trabajador.dto';
import { StorageService } from '../../common/services/storage.service';
import { validateSignatureOrThrow } from '../../common/utils/signature-validation';

@Injectable()
export class TrabajadoresService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly storageService: StorageService,
  ) {}

  private buildNombreCompleto(
    apellidoPaterno: string,
    apellidoMaterno: string,
    nombres: string,
  ): string {
    return [apellidoPaterno, apellidoMaterno, nombres].filter(Boolean).join(' ');
  }

  async create(dto: CreateTrabajadorDto): Promise<ResponseTrabajadorDto> {
    const documentoIdentidad = dto.numero_documento;
    const nombreCompleto = this.buildNombreCompleto(
      dto.apellido_paterno,
      dto.apellido_materno,
      dto.nombres,
    );

    const existing = await this.trabajadorRepository.findOne({
      where: {
        documentoIdentidad,
        empresaId: dto.empresa_id,
      },
      withDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        `El documento ${documentoIdentidad} ya se encuentra registrado para esta empresa`,
      );
    }

    const trabajador = this.trabajadorRepository.create({
      nombres: dto.nombres,
      apellidoPaterno: dto.apellido_paterno,
      apellidoMaterno: dto.apellido_materno,
      nombreCompleto,
      tipoDocumento: dto.tipo_documento,
      numeroDocumento: dto.numero_documento,
      documentoIdentidad,
      cargo: dto.cargo,
      areaId: dto.area_id ?? null,
      telefono: dto.telefono ?? null,
      emailPersonal: dto.email ?? null,
      emailCorporativo: dto.email_corporativo ?? null,
      fechaIngreso: new Date(dto.fecha_ingreso),
      estado: dto.estado ?? EstadoTrabajador.Activo,
      grupoSanguineo: dto.grupo_sanguineo ?? null,
      contactoEmergenciaNombre: dto.contacto_emergencia_nombre ?? null,
      contactoEmergenciaTelefono: dto.contacto_emergencia_telefono ?? null,
      fotoUrl: dto.foto_url ?? null,
      empresaId: dto.empresa_id,
      accesoTodasEmpresas: dto.acceso_todas_empresas ?? false,
      sede: dto.sede ?? null,
      unidad: dto.unidad ?? null,
      jefeDirecto: dto.jefe_directo ?? null,
      centroCostos: dto.centro_costos ?? null,
      nivelExposicion: dto.nivel_exposicion ?? null,
      tipoUsuario: dto.tipo_usuario ?? null,
      seguroAtencionMedica: dto.seguro_atencion_medica ?? null,
      fechaNacimiento: dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : null,
      sexo: dto.sexo as any ?? null,
      pais: dto.pais ?? null,
      departamento: dto.departamento ?? null,
      provincia: dto.provincia ?? null,
      distrito: dto.distrito ?? null,
      direccion: dto.direccion ?? null,
      numeroInterior: dto.numero_interior ?? null,
      urbanizacion: dto.urbanizacion ?? null,
      resideEnLugarTrabajo: dto.reside_en_lugar_trabajo ?? null,
      tiempoResidenciaLugarTrabajo: dto.tiempo_residencia_lugar_trabajo ?? null,
      estadoCivil: dto.estado_civil ?? null,
      gradoInstruccion: dto.grado_instruccion ?? null,
      nroHijosVivos: dto.nro_hijos_vivos ?? null,
      nroDependientes: dto.nro_dependientes ?? null,
      seguroEssalud: dto.seguro_essalud ?? null,
      seguroEps: dto.seguro_eps ?? null,
      seguroSctr: dto.seguro_sctr ?? null,
      seguroOtro: dto.seguro_otro ?? null,
      modalidadContrato: dto.modalidad_contrato ?? null,
      gerencia: dto.gerencia ?? null,
      puestoCapacitacion: dto.puesto_capacitacion ?? null,
      protocolosEmo: dto.protocolos_emo ?? null,
    });

    await this.trabajadorRepository.save(trabajador);
    const saved = await this.trabajadorRepository.findOne({
      where: { id: trabajador.id },
      relations: ['usuario', 'area', 'empresa'],
      withDeleted: false,
    });
    return ResponseTrabajadorDto.fromEntity(saved!);
  }

  async findAll(empresaId?: string): Promise<ResponseTrabajadorDto[]> {
    const where = empresaId ? { empresaId } : {};
    const trabajadores = await this.trabajadorRepository.find({
      where,
      relations: ['usuario', 'area', 'empresa'],
      order: { nombreCompleto: 'ASC' },
      withDeleted: false,
    });
    const dtos = trabajadores.map((t) => ResponseTrabajadorDto.fromEntity(t));
    return Promise.all(dtos.map((d) => this.enrichFotoUrl(d)));
  }

  private async enrichFotoUrl(dto: ResponseTrabajadorDto): Promise<ResponseTrabajadorDto> {
    if (dto.foto_url && dto.foto_url.includes('storage.googleapis.com') && this.storageService.isAvailable()) {
      try {
        dto.foto_url = await this.storageService.getSignedUrl(dto.foto_url, 60 * 24); // 24h
      } catch {
        // mantener URL original si falla la firma
      }
    }
    if (dto.firma_digital_url && dto.firma_digital_url.includes('storage.googleapis.com') && this.storageService.isAvailable()) {
      try {
        dto.firma_digital_url = await this.storageService.getSignedUrl(dto.firma_digital_url, 60); // 1h
      } catch {
        // mantener URL original si falla la firma
      }
    }
    return dto;
  }

  async findOne(id: string): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario', 'area', 'empresa'],
      withDeleted: false,
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    const dto = ResponseTrabajadorDto.fromEntity(trabajador);
    return this.enrichFotoUrl(dto);
  }

  async update(
    id: string,
    dto: UpdateTrabajadorDto,
  ): Promise<ResponseTrabajadorDto> {
    const trabajadorExistente = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario', 'area', 'empresa'],
      withDeleted: false,
    });

    if (!trabajadorExistente) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    const updateData: Partial<Trabajador> = { id };

    if (dto.nombres !== undefined || dto.apellido_paterno !== undefined || dto.apellido_materno !== undefined) {
      const apellidoPaterno = dto.apellido_paterno ?? trabajadorExistente.apellidoPaterno ?? '';
      const apellidoMaterno = dto.apellido_materno ?? trabajadorExistente.apellidoMaterno ?? '';
      const nombres = dto.nombres ?? trabajadorExistente.nombres ?? '';
      updateData.nombreCompleto = this.buildNombreCompleto(apellidoPaterno, apellidoMaterno, nombres);
    }
    if (dto.nombres !== undefined) updateData.nombres = dto.nombres;
    if (dto.apellido_paterno !== undefined) updateData.apellidoPaterno = dto.apellido_paterno;
    if (dto.apellido_materno !== undefined) updateData.apellidoMaterno = dto.apellido_materno;
    if (dto.cargo !== undefined) updateData.cargo = dto.cargo;
    if (dto.area_id !== undefined) {
      updateData.areaId = dto.area_id === null || dto.area_id === '' ? null : dto.area_id;
    }
    if (dto.telefono !== undefined) updateData.telefono = dto.telefono || null;
    if (dto.email !== undefined) updateData.emailPersonal = dto.email || null;
    if (dto.email_corporativo !== undefined) updateData.emailCorporativo = dto.email_corporativo || null;
    if (dto.fecha_ingreso !== undefined) updateData.fechaIngreso = new Date(dto.fecha_ingreso);
    if (dto.estado !== undefined) updateData.estado = dto.estado;
    if (dto.grupo_sanguineo !== undefined) updateData.grupoSanguineo = dto.grupo_sanguineo || null;
    if (dto.contacto_emergencia_nombre !== undefined) updateData.contactoEmergenciaNombre = dto.contacto_emergencia_nombre || null;
    if (dto.contacto_emergencia_telefono !== undefined) updateData.contactoEmergenciaTelefono = dto.contacto_emergencia_telefono || null;
    if (dto.foto_url !== undefined) updateData.fotoUrl = dto.foto_url || null;
    if (dto.sede !== undefined) updateData.sede = dto.sede || null;
    if (dto.unidad !== undefined) updateData.unidad = dto.unidad || null;
    if (dto.jefe_directo !== undefined) updateData.jefeDirecto = dto.jefe_directo || null;
    if (dto.centro_costos !== undefined) updateData.centroCostos = dto.centro_costos || null;
    if (dto.nivel_exposicion !== undefined) updateData.nivelExposicion = dto.nivel_exposicion || null;
    if (dto.tipo_usuario !== undefined) updateData.tipoUsuario = dto.tipo_usuario || null;
    if (dto.seguro_atencion_medica !== undefined) updateData.seguroAtencionMedica = dto.seguro_atencion_medica || null;
    if (dto.fecha_nacimiento !== undefined) updateData.fechaNacimiento = dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : null;
    if (dto.sexo !== undefined) updateData.sexo = dto.sexo as any || null;
    if (dto.pais !== undefined) updateData.pais = dto.pais || null;
    if (dto.departamento !== undefined) updateData.departamento = dto.departamento || null;
    if (dto.provincia !== undefined) updateData.provincia = dto.provincia || null;
    if (dto.distrito !== undefined) updateData.distrito = dto.distrito || null;
    if (dto.direccion !== undefined) updateData.direccion = dto.direccion || null;
    if (dto.numero_interior !== undefined) updateData.numeroInterior = dto.numero_interior || null;
    if (dto.urbanizacion !== undefined) updateData.urbanizacion = dto.urbanizacion || null;
    if (dto.reside_en_lugar_trabajo !== undefined) updateData.resideEnLugarTrabajo = dto.reside_en_lugar_trabajo;
    if (dto.tiempo_residencia_lugar_trabajo !== undefined) updateData.tiempoResidenciaLugarTrabajo = dto.tiempo_residencia_lugar_trabajo || null;
    if (dto.estado_civil !== undefined) updateData.estadoCivil = dto.estado_civil as any || null;
    if (dto.grado_instruccion !== undefined) updateData.gradoInstruccion = dto.grado_instruccion as any || null;
    if (dto.nro_hijos_vivos !== undefined) updateData.nroHijosVivos = dto.nro_hijos_vivos ?? null;
    if (dto.nro_dependientes !== undefined) updateData.nroDependientes = dto.nro_dependientes ?? null;
    if (dto.seguro_essalud !== undefined) updateData.seguroEssalud = dto.seguro_essalud;
    if (dto.seguro_eps !== undefined) updateData.seguroEps = dto.seguro_eps;
    if (dto.seguro_sctr !== undefined) updateData.seguroSctr = dto.seguro_sctr;
    if (dto.seguro_otro !== undefined) updateData.seguroOtro = dto.seguro_otro || null;
    if (dto.modalidad_contrato !== undefined) updateData.modalidadContrato = dto.modalidad_contrato || null;
    if (dto.gerencia !== undefined) updateData.gerencia = dto.gerencia || null;
    if (dto.puesto_capacitacion !== undefined) updateData.puestoCapacitacion = dto.puesto_capacitacion || null;
    if (dto.protocolos_emo !== undefined) updateData.protocolosEmo = dto.protocolos_emo || null;
    if (dto.talla_casco !== undefined) updateData.tallaCasco = dto.talla_casco || null;
    if (dto.talla_camisa !== undefined) updateData.tallaCamisa = dto.talla_camisa || null;
    if (dto.talla_pantalon !== undefined) updateData.tallaPantalon = dto.talla_pantalon || null;
    if (dto.talla_calzado !== undefined) {
      const parsed = typeof dto.talla_calzado === 'string' ? parseInt(dto.talla_calzado, 10) : dto.talla_calzado;
      updateData.tallaCalzado = isNaN(parsed as number) ? null : (parsed as number);
    }
    if (dto.perfil_completado !== undefined) updateData.perfilCompletado = dto.perfil_completado;

    if (dto.firma_digital_url !== undefined) {
      if (dto.firma_digital_url !== '' && dto.firma_digital_url.startsWith('data:image/')) {
        validateSignatureOrThrow(dto.firma_digital_url, 'firma digital');
        if (this.storageService.isAvailable()) {
          const base64Data = dto.firma_digital_url.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const empresa = trabajadorExistente.empresa as any;
          const rucEmpresa = empresa?.ruc ?? 'sistema';
          updateData.firmaDigitalUrl = await this.storageService.uploadFile(
            rucEmpresa,
            buffer,
            'firma_trabajador',
            { filename: `firma-${id}.png` },
          );
        } else {
          updateData.firmaDigitalUrl = dto.firma_digital_url;
        }
      } else if (dto.firma_digital_url === '') {
        updateData.firmaDigitalUrl = null;
      }
    }

    const trabajador = await this.trabajadorRepository.preload(updateData);
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado después de preload`);
    }

    const nuevoEstado = trabajador.estado;
    const estadoCambio = dto.estado !== undefined && dto.estado !== trabajadorExistente.estado;

    const saved = await this.trabajadorRepository.save(trabajador);

    if (estadoCambio) {
      const usuarioVinculado = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.trabajador', 'trabajador')
        .where('trabajador.id = :trabajadorId', { trabajadorId: trabajador.id })
        .andWhere('usuario.deletedAt IS NULL')
        .getOne();

      if (usuarioVinculado) {
        usuarioVinculado.activo = nuevoEstado === EstadoTrabajador.Activo;
        await this.usuarioRepository.save(usuarioVinculado);
      }
    }

    const updated = await this.trabajadorRepository.findOne({
      where: { id: saved.id },
      relations: ['usuario', 'area', 'empresa'],
      withDeleted: false,
    });

    if (!updated) {
      throw new NotFoundException(`Error al recuperar el trabajador actualizado con ID ${id}`);
    }

    const responseDto = ResponseTrabajadorDto.fromEntity(updated);
    return this.enrichFotoUrl(responseDto);
  }

  async remove(id: string): Promise<void> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario'],
      withDeleted: false,
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    await this.trabajadorRepository.softRemove(trabajador);

    if (trabajador.usuario) {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: trabajador.usuario.id },
        withDeleted: false,
      });

      if (usuario) {
        usuario.activo = false;
        await this.usuarioRepository.save(usuario);
        await this.usuarioRepository.softRemove(usuario);
      }
    }
  }

  async desactivar(id: string): Promise<ResponseTrabajadorDto> {
    return this.update(id, { estado: EstadoTrabajador.Inactivo });
  }

  async activar(id: string): Promise<ResponseTrabajadorDto> {
    return this.update(id, { estado: EstadoTrabajador.Activo });
  }

  async updatePersonalData(
    id: string,
    dto: UpdatePersonalDataDto,
  ): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['empresa'],
      withDeleted: false,
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    let firmaUrl = trabajador.firmaDigitalUrl;
    if (dto.firma_digital_url !== undefined) {
      if (dto.firma_digital_url !== '' && dto.firma_digital_url.startsWith('data:image/')) {
        validateSignatureOrThrow(dto.firma_digital_url, 'firma digital');
        if (this.storageService.isAvailable()) {
          const base64Data = dto.firma_digital_url.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const empresa = trabajador.empresa as any;
          const rucEmpresa = empresa?.ruc ?? 'sistema';
          firmaUrl = await this.storageService.uploadFile(
            rucEmpresa,
            buffer,
            'firma_trabajador',
            { filename: `firma-${id}.png` },
          );
        } else {
          firmaUrl = dto.firma_digital_url;
        }
      } else if (dto.firma_digital_url === '') {
        firmaUrl = null;
      }
    }

    Object.assign(trabajador, {
      tallaCasco: dto.talla_casco !== undefined ? dto.talla_casco : trabajador.tallaCasco,
      tallaCamisa: dto.talla_camisa !== undefined ? dto.talla_camisa : trabajador.tallaCamisa,
      tallaPantalon: dto.talla_pantalon !== undefined ? dto.talla_pantalon : trabajador.tallaPantalon,
      tallaCalzado: dto.talla_calzado !== undefined ? parseInt(dto.talla_calzado) : trabajador.tallaCalzado,
      firmaDigitalUrl: firmaUrl,
      perfilCompletado: true,
    });

    await this.trabajadorRepository.save(trabajador);
    const updated = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario', 'area', 'empresa'],
      withDeleted: false,
    });
    return ResponseTrabajadorDto.fromEntity(updated!);
  }

  async updateMedicoPersonalData(
    id: string,
    dto: UpdateMedicoPersonalDataDto,
  ): Promise<ResponseTrabajadorDto> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['empresa'],
      withDeleted: false,
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }

    let firmaUrl = trabajador.firmaDigitalUrl;
    const firmaFinal = dto.firma_imagen_base64 || dto.firma_digital_url;
    if (firmaFinal !== undefined && firmaFinal && firmaFinal.startsWith('data:image/')) {
      validateSignatureOrThrow(firmaFinal, 'firma digital');
      if (this.storageService.isAvailable()) {
        const base64Data = firmaFinal.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const empresa = trabajador.empresa as any;
        const rucEmpresa = empresa?.ruc ?? 'sistema';
        firmaUrl = await this.storageService.uploadFile(
          rucEmpresa,
          buffer,
          'firma_medico',
          { filename: `firma-medico-${id}.png` },
        );
      } else {
        firmaUrl = firmaFinal;
      }
    }

    let selloUrl = trabajador.selloUrl;
    if (dto.sello_base64 !== undefined && dto.sello_base64 && dto.sello_base64.startsWith('data:image/')) {
      if (this.storageService.isAvailable()) {
        const base64Data = dto.sello_base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const empresa = trabajador.empresa as any;
        const rucEmpresa = empresa?.ruc ?? 'sistema';
        selloUrl = await this.storageService.uploadFile(
          rucEmpresa,
          buffer,
          'sello_medico',
          { filename: `sello-medico-${id}.png` },
        );
      } else {
        selloUrl = dto.sello_base64;
      }
    }

    let logoDocumentosUrl = trabajador.logoDocumentosUrl;
    if (dto.logo_documentos_base64 !== undefined) {
      if (dto.logo_documentos_base64 && dto.logo_documentos_base64.startsWith('data:image/')) {
        if (this.storageService.isAvailable()) {
          const base64Data = dto.logo_documentos_base64.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const empresa = trabajador.empresa as any;
          const rucEmpresa = empresa?.ruc ?? 'sistema';
          logoDocumentosUrl = await this.storageService.uploadFile(
            rucEmpresa,
            buffer,
            'logo_documentos',
            { filename: `logo-documentos-${id}.png` },
          );
        } else {
          logoDocumentosUrl = dto.logo_documentos_base64;
        }
      } else {
        logoDocumentosUrl = null;
      }
    }

    Object.assign(trabajador, {
      cmp: dto.cmp !== undefined ? dto.cmp : trabajador.cmp,
      rne: dto.rne !== undefined ? dto.rne : trabajador.rne,
      firmaDigitalUrl: firmaUrl,
      selloUrl: selloUrl !== undefined ? selloUrl : trabajador.selloUrl,
      tituloSello: dto.titulo_sello !== undefined ? dto.titulo_sello : trabajador.tituloSello,
      logoDocumentosUrl: logoDocumentosUrl !== undefined ? logoDocumentosUrl : trabajador.logoDocumentosUrl,
      tallaCasco: dto.talla_casco !== undefined ? dto.talla_casco : trabajador.tallaCasco,
      tallaCamisa: dto.talla_camisa !== undefined ? dto.talla_camisa : trabajador.tallaCamisa,
      tallaPantalon: dto.talla_pantalon !== undefined ? dto.talla_pantalon : trabajador.tallaPantalon,
      tallaCalzado: dto.talla_calzado !== undefined ? parseInt(dto.talla_calzado) : trabajador.tallaCalzado,
      perfilCompletado: true,
    });

    await this.trabajadorRepository.save(trabajador);
    const updated = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['usuario', 'area', 'empresa'],
      withDeleted: false,
    });
    return ResponseTrabajadorDto.fromEntity(updated!);
  }

  async uploadFoto(
    id: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: ['empresa'],
      withDeleted: false,
    });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    if (!this.storageService.isAvailable()) {
      throw new BadRequestException('El almacenamiento no está configurado');
    }
    const empresa = trabajador.empresa as any;
    const rucEmpresa = empresa?.ruc ?? 'sistema';
    // Nombre fijo por trabajador: sobrescribe la foto anterior para evitar llenar el bucket
    const fixedFilename = `foto-${id}.jpg`;
    if (trabajador.fotoUrl) {
      await this.storageService.deleteFileByUrl(trabajador.fotoUrl).catch(() => {});
    }
    const url = await this.storageService.uploadFile(
      rucEmpresa,
      buffer,
      'foto_trabajador',
      { filename: fixedFilename, contentType: mimetype },
    );
    trabajador.fotoUrl = url;
    await this.trabajadorRepository.save(trabajador);
    return url;
  }

  async buscarPorDni(dni: string): Promise<ResponseTrabajadorDto | null> {
    const trabajador = await this.trabajadorRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.usuario', 'usuario')
      .leftJoinAndSelect('t.area', 'area')
      .leftJoinAndSelect('t.empresa', 'empresa')
      .where('t.documentoIdentidad = :dni OR t.numeroDocumento = :dni', { dni })
      .andWhere('t.deletedAt IS NULL')
      .getOne();

    if (!trabajador) {
      return null;
    }

    return ResponseTrabajadorDto.fromEntity(trabajador);
  }

  async buscar(empresaId?: string, q?: string): Promise<ResponseTrabajadorDto[]> {
    if (!q || q.trim().length < 2) {
      return [];
    }
    const term = `%${q.trim()}%`;
    const qb = this.trabajadorRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.area', 'area')
      .leftJoinAndSelect('t.empresa', 'empresa')
      .where('t.deletedAt IS NULL')
      .andWhere(
        '(t.nombreCompleto ILIKE :term OR t.nombres ILIKE :term OR t.apellidoPaterno ILIKE :term OR t.apellidoMaterno ILIKE :term OR t.documentoIdentidad ILIKE :term OR t.numeroDocumento ILIKE :term)',
        { term },
      )
      .orderBy('t.nombreCompleto', 'ASC')
      .take(20);

    if (empresaId) {
      qb.andWhere('t.empresaId = :empresaId', { empresaId });
    }

    const trabajadores = await qb.getMany();
    return trabajadores.map((t) => ResponseTrabajadorDto.fromEntity(t));
  }
}
