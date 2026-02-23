import {
  TipoExamen,
  ResultadoExamen,
  EstadoExamen,
} from '../entities/examen-medico.entity';

export class ResponseExamenMedicoDto {
  id: string;
  trabajador_id: string;
  trabajador_nombre: string | null;
  trabajador_documento: string | null;
  trabajador_cargo: string | null;
  /** Datos de trabajador para Ficha Anexo 02 Sección II */
  trabajador_filiacion?: {
    id: string;
    nombre_completo: string;
    documento_identidad: string;
    fecha_nacimiento: string | null;
    foto_url: string | null;
    telefono: string | null;
    email_personal: string | null;
    direccion: string | null;
    numero_interior: string | null;
    urbanizacion: string | null;
    departamento: string | null;
    provincia: string | null;
    distrito: string | null;
    pais: string | null;
    reside_en_lugar_trabajo: boolean | null;
    tiempo_residencia_lugar_trabajo: string | null;
    estado_civil: string | null;
    grado_instruccion: string | null;
    nro_hijos_vivos: number | null;
    nro_dependientes: number | null;
    seguro_essalud: boolean | null;
    seguro_eps: boolean | null;
    seguro_sctr: boolean | null;
    seguro_otro: string | null;
  } | null;
  /** Datos de empresa para Ficha Anexo 02 */
  empresa_id: string | null;
  empresa_nombre: string | null;
  empresa_direccion: string | null;
  empresa_actividad_economica: string | null;
  empresa_departamento: string | null;
  empresa_provincia: string | null;
  empresa_distrito: string | null;
  empresa_pais: string | null;
  proyecto: string | null;
  sede: string | null;
  tipo_examen: TipoExamen;
  hora_programacion: string | null;
  perfil_emo_id: string | null;
  adicionales: string | null;
  recomendaciones_personalizadas: string | null;
  fecha_programada: string;
  fecha_realizado: string | null;
  fecha_vencimiento: string | null;
  centro_medico: string;
  medico_evaluador: string | null;
  resultado: ResultadoExamen;
  restricciones: string | null;
  observaciones: string | null;
  diagnosticos_cie10: Array<{ code: string; description: string; tipo?: 'P' | 'D' | 'R' }> | null;
  programas_vigilancia: string[] | null;
  /** Sección VI: Evaluación clínica (anamnesis, ectoscopía, examen físico) */
  evaluacion_clinica: {
    anamnesis?: string;
    ectoscopia?: string;
    estadoMental?: string;
    antropometria?: { talla: number; peso: number; imc: number; perimetroAbdominal?: number };
    funcionesVitales?: {
      frecuenciaRespiratoria?: number;
      frecuenciaCardiaca?: number;
      presionArterial?: string;
      temperatura?: number;
      otros?: string;
    };
    examenFisico?: Array<{
      organoSistema: string;
      sinHallazgo: boolean;
      hallazgoDetalle: string | null;
      ojosAnexos?: Record<string, string>;
      aparatoLocomotor?: Record<string, string>;
    }>;
    resumenAuxiliares?: {
      psicologia?: string;
      radiografia?: string;
      laboratorio?: string;
      audiometria?: string;
      espirometria?: string;
      otros?: string;
    };
    diagnosticos_ocupacionales?: Array<{ code: string; description: string; tipo: 'P' | 'D' | 'R' }>;
    otros_diagnosticos?: Array<{ code: string; description: string; tipo: 'P' | 'D' | 'R' }>;
    recomendaciones?: string;
  } | null;
  resultado_archivo_url: string | null;
  /** Indica si existe archivo EMO (para admin sin acceso a descarga) */
  resultado_archivo_existe?: boolean;
  estado: EstadoExamen;
  visto_por_admin: boolean;
  revisado_por_doctor: boolean;
  doctor_interno_id: string | null;
  fecha_revision_doctor: string | null;
  cargado_por: string | null;
  cargado_por_id: string;
  /** Seguimientos (interconsultas y vigilancias) del EMO */
  seguimientos?: Array<{
    id: string;
    tipo: string;
    cie10_code: string;
    cie10_description: string | null;
    especialidad: string;
    estado: string;
    plazo: string;
    motivo: string | null;
  }>;
  /** Documentos subidos por centro médico (solo cuando aplica) */
  documentos?: Array<{
    id: string;
    tipo_etiqueta: string;
    prueba_medica?: { id: string; nombre: string };
    nombre_archivo: string;
    url: string;
    created_at: string;
  }>;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(examen: {
    id: string;
    trabajadorId: string;
    tipoExamen: TipoExamen;
    fechaProgramada: Date;
    fechaRealizado: Date | null;
    fechaVencimiento: Date | null;
    centroMedico: string;
    medicoEvaluador: string | null;
    resultado: ResultadoExamen;
    restricciones: string | null;
    observaciones: string | null;
    diagnosticosCie10?: Array<{ code: string; description: string }> | null;
    programasVigilancia?: string[] | null;
    resultadoArchivoUrl: string | null;
    estado: EstadoExamen;
    vistoPorAdmin?: boolean;
    revisadoPorDoctor: boolean;
    doctorInternoId: string | null;
    fechaRevisionDoctor: Date | null;
    cargadoPorId: string;
    proyecto?: string | null;
    horaProgramacion?: string | null;
    perfilEmoId?: string | null;
    adicionales?: string | null;
    recomendacionesPersonalizadas?: string | null;
    trabajador?: {
      id: string;
      nombreCompleto: string;
      documentoIdentidad?: string;
      sede?: string | null;
      cargo?: string | null;
      fechaNacimiento?: Date | string | null;
      fotoUrl?: string | null;
      telefono?: string | null;
      emailPersonal?: string | null;
      direccion?: string | null;
      numeroInterior?: string | null;
      urbanizacion?: string | null;
      departamento?: string | null;
      provincia?: string | null;
      distrito?: string | null;
      pais?: string | null;
      resideEnLugarTrabajo?: boolean | null;
      tiempoResidenciaLugarTrabajo?: string | null;
      estadoCivil?: string | null;
      gradoInstruccion?: string | null;
      nroHijosVivos?: number | null;
      nroDependientes?: number | null;
      seguroEssalud?: boolean | null;
      seguroEps?: boolean | null;
      seguroSctr?: boolean | null;
      seguroOtro?: string | null;
      empresa?: {
        id: string;
        nombre: string;
        direccion?: string | null;
        actividadEconomica?: string | null;
        departamento?: string | null;
        provincia?: string | null;
        distrito?: string | null;
        pais?: string | null;
      } | null;
    } | null;
    cargadoPor?: { nombreCompleto?: string; dni?: string } | null;
    createdAt: Date;
    updatedAt: Date;
  }): ResponseExamenMedicoDto {
    const toDateStr = (d: Date | string | null): string | null => {
      if (!d) return null;
      if (typeof d === 'string') return d.split('T')[0];
      return d.toISOString().split('T')[0];
    };
    const dto = new ResponseExamenMedicoDto();
    dto.id = examen.id;
    dto.trabajador_id = examen.trabajadorId;
    dto.trabajador_nombre = examen.trabajador?.nombreCompleto || null;
    dto.trabajador_documento = examen.trabajador?.documentoIdentidad ?? null;
    dto.trabajador_cargo = examen.trabajador?.cargo ?? null;
    const t = examen.trabajador as any;
    if (t) {
      const toDateStr = (d: Date | string | null | undefined): string | null => {
        if (!d) return null;
        if (typeof d === 'string') return d.split('T')[0];
        return (d as Date).toISOString().split('T')[0];
      };
      dto.trabajador_filiacion = {
        id: t.id,
        nombre_completo: t.nombreCompleto || '',
        documento_identidad: t.documentoIdentidad || '',
        fecha_nacimiento: toDateStr(t.fechaNacimiento),
        foto_url: t.fotoUrl ?? null,
        telefono: t.telefono ?? null,
        email_personal: t.emailPersonal ?? null,
        direccion: t.direccion ?? null,
        numero_interior: t.numeroInterior ?? null,
        urbanizacion: t.urbanizacion ?? null,
        departamento: t.departamento ?? null,
        provincia: t.provincia ?? null,
        distrito: t.distrito ?? null,
        pais: t.pais ?? null,
        reside_en_lugar_trabajo: t.resideEnLugarTrabajo ?? null,
        tiempo_residencia_lugar_trabajo: t.tiempoResidenciaLugarTrabajo ?? null,
        estado_civil: t.estadoCivil ?? null,
        grado_instruccion: t.gradoInstruccion ?? null,
        nro_hijos_vivos: t.nroHijosVivos ?? null,
        nro_dependientes: t.nroDependientes ?? null,
        seguro_essalud: t.seguroEssalud ?? null,
        seguro_eps: t.seguroEps ?? null,
        seguro_sctr: t.seguroSctr ?? null,
        seguro_otro: t.seguroOtro ?? null,
      };
    } else {
      dto.trabajador_filiacion = null;
    }
    const emp = (examen.trabajador as any)?.empresa;
    dto.empresa_id = emp?.id ?? null;
    dto.empresa_nombre = emp?.nombre ?? null;
    dto.empresa_direccion = emp?.direccion ?? null;
    dto.empresa_actividad_economica = emp?.actividadEconomica ?? null;
    dto.empresa_departamento = emp?.departamento ?? null;
    dto.empresa_provincia = emp?.provincia ?? null;
    dto.empresa_distrito = emp?.distrito ?? null;
    dto.empresa_pais = emp?.pais ?? null;
    dto.proyecto = examen.proyecto ?? null;
    dto.sede = examen.trabajador?.sede ?? null;
    dto.tipo_examen = examen.tipoExamen;
    dto.hora_programacion = examen.horaProgramacion ?? null;
    dto.perfil_emo_id = examen.perfilEmoId ?? null;
    dto.adicionales = examen.adicionales ?? null;
    dto.recomendaciones_personalizadas = examen.recomendacionesPersonalizadas ?? null;
    dto.fecha_programada = toDateStr(examen.fechaProgramada as Date | string) ?? '';
    dto.fecha_realizado = toDateStr(examen.fechaRealizado as Date | string | null);
    dto.fecha_vencimiento = toDateStr(examen.fechaVencimiento as Date | string | null);
    dto.centro_medico = examen.centroMedico;
    dto.medico_evaluador = examen.medicoEvaluador ?? null;
    dto.resultado = examen.resultado;
    dto.restricciones = examen.restricciones;
    dto.observaciones = examen.observaciones;
    dto.diagnosticos_cie10 = examen.diagnosticosCie10 ?? null;
    dto.programas_vigilancia = examen.programasVigilancia ?? null;
    dto.evaluacion_clinica = (examen as any).evaluacionClinica ?? null;
    dto.resultado_archivo_url = examen.resultadoArchivoUrl;
    dto.estado = examen.estado;
    dto.visto_por_admin = examen.vistoPorAdmin ?? false;
    dto.revisado_por_doctor = examen.revisadoPorDoctor;
    dto.doctor_interno_id = examen.doctorInternoId;
    dto.fecha_revision_doctor = examen.fechaRevisionDoctor
      ? (typeof examen.fechaRevisionDoctor === 'string'
          ? examen.fechaRevisionDoctor
          : examen.fechaRevisionDoctor.toISOString())
      : null;
    dto.cargado_por =
      examen.cargadoPor?.nombreCompleto || examen.cargadoPor?.dni || null;
    dto.cargado_por_id = examen.cargadoPorId;
    dto.createdAt = examen.createdAt;
    dto.updatedAt = examen.updatedAt;
    return dto;
  }
}
