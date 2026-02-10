import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Capacitacion } from '../capacitaciones/entities/capacitacion.entity';
import { AsistenciaCapacitacion } from '../capacitaciones/entities/asistencia-capacitacion.entity';
import { Incidente, TipoIncidente, EstadoIncidente, SeveridadIncidente } from '../incidentes/entities/incidente.entity';
import { AccionCorrectiva, EstadoAccion, FuenteAccion } from '../acciones-correctivas/entities/accion-correctiva.entity';
import { Inspeccion } from '../inspecciones/entities/inspeccion.entity';
import { HallazgoInspeccion, EstadoHallazgo } from '../inspecciones/entities/hallazgo-inspeccion.entity';
import { Trabajador, EstadoTrabajador } from '../trabajadores/entities/trabajador.entity';
import { Area } from '../empresas/entities/area.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Capacitacion)
    private readonly capacitacionRepository: Repository<Capacitacion>,
    @InjectRepository(AsistenciaCapacitacion)
    private readonly asistenciaRepository: Repository<AsistenciaCapacitacion>,
    @InjectRepository(Incidente)
    private readonly incidenteRepository: Repository<Incidente>,
    @InjectRepository(AccionCorrectiva)
    private readonly accionCorrectivaRepository: Repository<AccionCorrectiva>,
    @InjectRepository(Inspeccion)
    private readonly inspeccionRepository: Repository<Inspeccion>,
    @InjectRepository(HallazgoInspeccion)
    private readonly hallazgoRepository: Repository<HallazgoInspeccion>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async getCumplimientoCapacitaciones(
    empresaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (fechaDesde && fechaHasta) {
      where.fecha = Between(fechaDesde, fechaHasta);
    }

    const capacitaciones = await this.capacitacionRepository.find({ where });
    const trabajadores = await this.trabajadorRepository.find({
      where: { empresaId, estado: EstadoTrabajador.Activo },
    });
    const totalTrabajadores = trabajadores.length;

    // Contar trabajadores con al menos 1 capacitación
    const trabajadoresConCapacitacion = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .leftJoin('asistencia.capacitacion', 'capacitacion')
      .where('capacitacion.empresaId = :empresaId', { empresaId })
      .andWhere('asistencia.asistencia = :asistencia', { asistencia: true })
      .select('COUNT(DISTINCT asistencia.trabajadorId)', 'count')
      .getRawOne();

    const trabajadoresConAlMenosUna = parseInt(
      trabajadoresConCapacitacion?.count || '0',
    );
    const porcentajeCumplimiento =
      totalTrabajadores > 0
        ? Math.round((trabajadoresConAlMenosUna / totalTrabajadores) * 100)
        : 0;

    // Por área
    const areas = await this.areaRepository.find({ where: { empresaId } });
    const cumplimientoPorArea = await Promise.all(
      areas.map(async (area) => {
        const trabajadoresArea = await this.trabajadorRepository.count({
          where: { empresaId, areaId: area.id, estado: EstadoTrabajador.Activo },
        });

        const trabajadoresAreaConCapacitacion = await this.asistenciaRepository
          .createQueryBuilder('asistencia')
          .leftJoin('asistencia.capacitacion', 'capacitacion')
          .leftJoin('asistencia.trabajador', 'trabajador')
          .where('capacitacion.empresaId = :empresaId', { empresaId })
          .andWhere('trabajador.areaId = :areaId', { areaId: area.id })
          .andWhere('asistencia.asistencia = :asistencia', { asistencia: true })
          .select('COUNT(DISTINCT asistencia.trabajadorId)', 'count')
          .getRawOne();

        const conCapacitacion = parseInt(
          trabajadoresAreaConCapacitacion?.count || '0',
        );
        const porcentaje =
          trabajadoresArea > 0
            ? Math.round((conCapacitacion / trabajadoresArea) * 100)
            : 0;

        return {
          area_id: area.id,
          area_nombre: area.nombre,
          trabajadores_con_capacitacion: conCapacitacion,
          total_trabajadores: trabajadoresArea,
          porcentaje_cumplimiento: porcentaje,
        };
      }),
    );

    return {
      porcentaje_cumplimiento: porcentajeCumplimiento,
      total_trabajadores: totalTrabajadores,
      trabajadores_con_capacitacion: trabajadoresConAlMenosUna,
      por_area: cumplimientoPorArea,
    };
  }

  async getAccidentesVsIncidentes(
    empresaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (fechaDesde && fechaHasta) {
      where.fechaHora = Between(fechaDesde, fechaHasta);
    }

    const incidentes = await this.incidenteRepository.find({ where });

    // Agrupar por mes
    const agrupados: Record<string, { accidentes: number; incidentes: number }> = {};

    incidentes.forEach((inc) => {
      const fecha = new Date(inc.fechaHora);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      if (!agrupados[mes]) {
        agrupados[mes] = { accidentes: 0, incidentes: 0 };
      }

      if (inc.tipo === TipoIncidente.Accidente) {
        agrupados[mes].accidentes++;
      } else {
        agrupados[mes].incidentes++;
      }
    });

    return Object.entries(agrupados)
      .map(([mes, datos]) => ({
        mes,
        accidentes: datos.accidentes,
        incidentes: datos.incidentes,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  async getMedidasCorrectivas(
    empresaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (fechaDesde && fechaHasta) {
      where.fechaProgramada = Between(fechaDesde, fechaHasta);
    }

    const medidas = await this.accionCorrectivaRepository.find({ where });

    // Agrupar por mes
    const agrupados: Record<
      string,
      { programadas: number; ejecutadas: number }
    > = {};

    medidas.forEach((medida) => {
      const fecha = new Date(medida.fechaProgramada);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      if (!agrupados[mes]) {
        agrupados[mes] = { programadas: 0, ejecutadas: 0 };
      }

      agrupados[mes].programadas++;

      if (
        medida.estado === EstadoAccion.Aprobado ||
        medida.fechaEjecucion !== null
      ) {
        agrupados[mes].ejecutadas++;
      }
    });

    return Object.entries(agrupados)
      .map(([mes, datos]) => ({
        mes,
        programadas: datos.programadas,
        ejecutadas: datos.ejecutadas,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  async getInspeccionesPorMes(
    empresaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (fechaDesde && fechaHasta) {
      where.fechaInspeccion = Between(fechaDesde, fechaHasta);
    }

    const inspecciones = await this.inspeccionRepository.find({ where });

    // Agrupar por mes y tipo
    const agrupados: Record<string, Record<string, number>> = {};

    inspecciones.forEach((inspeccion) => {
      const fecha = new Date(inspeccion.fechaInspeccion);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const tipo = inspeccion.tipoInspeccion;

      if (!agrupados[mes]) {
        agrupados[mes] = {};
      }

      agrupados[mes][tipo] = (agrupados[mes][tipo] || 0) + 1;
    });

    return Object.entries(agrupados).map(([mes, tipos]) => ({
      mes,
      ...tipos,
    }));
  }

  async getPorcentajeLevantamientoAcciones(empresaId: string) {
    const hallazgos = await this.hallazgoRepository
      .createQueryBuilder('hallazgo')
      .leftJoin('hallazgo.inspeccion', 'inspeccion')
      .where('inspeccion.empresaId = :empresaId', { empresaId })
      .getMany();

    const totalHallazgos = hallazgos.length;
    const hallazgosCerrados = hallazgos.filter(
      (h) => h.estadoHallazgo === EstadoHallazgo.Corregido,
    ).length;

    const porcentaje =
      totalHallazgos > 0
        ? Math.round((hallazgosCerrados / totalHallazgos) * 100)
        : 0;

    return {
      porcentaje_levantamiento: porcentaje,
      total_hallazgos: totalHallazgos,
      hallazgos_cerrados: hallazgosCerrados,
    };
  }

  async getActosCondiciones(
    empresaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId, fuente: FuenteAccion.ActosCondiciones };
    if (fechaDesde && fechaHasta) {
      where.fechaProgramada = Between(fechaDesde, fechaHasta);
    }

    const acciones = await this.accionCorrectivaRepository.find({
      where,
      relations: ['area'],
    });

    // Área que detecta vs Área que reporta
    const deteccionVsReporte: Record<
      string,
      { detecta: number; reporta: number }
    > = {};

    acciones.forEach((accion) => {
      const areaNombre = accion.area?.nombre || 'Sin área';
      if (!deteccionVsReporte[areaNombre]) {
        deteccionVsReporte[areaNombre] = { detecta: 0, reporta: 0 };
      }
      // Por ahora, asumimos que la misma área detecta y reporta
      deteccionVsReporte[areaNombre].detecta++;
      deteccionVsReporte[areaNombre].reporta++;
    });

    // Por estado
    const porEstado: Record<string, number> = {};
    acciones.forEach((accion) => {
      porEstado[accion.estado] = (porEstado[accion.estado] || 0) + 1;
    });

    return {
      deteccion_vs_reporte: Object.entries(deteccionVsReporte).map(
        ([area, datos]) => ({
          area,
          detecta: datos.detecta,
          reporta: datos.reporta,
        }),
      ),
      por_estado: Object.entries(porEstado).map(([estado, cantidad]) => ({
        estado,
        cantidad,
      })),
    };
  }

  // ========== REPORTES DE ACCIDENTES E INCIDENTES ==========

  async getDiasDesdeUltimoIncidentePorSede(
    empresaId: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (fechaDesde && fechaHasta) {
      where.fechaHora = Between(fechaDesde, fechaHasta);
    }

    const query = this.incidenteRepository
      .createQueryBuilder('incidente')
      .where('incidente.empresaId = :empresaId', { empresaId });

    if (fechaDesde && fechaHasta) {
      query.andWhere('incidente.fechaHora BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde,
        fechaHasta,
      });
    }

    const incidentesRaw = await query
      .select('incidente.areaTrabajo', 'sede')
      .addSelect('MAX(incidente.fechaHora)', 'ultima_fecha')
      .groupBy('incidente.areaTrabajo')
      .getRawMany();

    // Si la consulta anterior falla, usar una alternativa
    const allIncidentes = await query.getMany();
    const agrupadosPorSede: Record<string, Date> = {};
    
    allIncidentes.forEach((inc) => {
      const sede = inc.areaTrabajo || 'Sin sede';
      if (!agrupadosPorSede[sede] || inc.fechaHora > agrupadosPorSede[sede]) {
        agrupadosPorSede[sede] = inc.fechaHora;
      }
    });

    const hoy = new Date();
    return Object.entries(agrupadosPorSede).map(([sede, ultimaFecha]) => {
      const diasTranscurridos = Math.floor(
        (hoy.getTime() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        sede: sede || 'Sin sede',
        dias_desde_ultimo: diasTranscurridos,
        ultima_fecha: ultimaFecha.toISOString(),
      };
    });
  }

  async getTendenciaTemporalIncidentes(
    empresaId: string,
    sede?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const query = this.incidenteRepository
      .createQueryBuilder('incidente')
      .where('incidente.empresaId = :empresaId', { empresaId });

    if (sede) {
      query.andWhere('incidente.areaTrabajo = :sede', { sede });
    }

    if (fechaDesde && fechaHasta) {
      query.andWhere('incidente.fechaHora BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde,
        fechaHasta,
      });
    }

    const incidentes = await query
      .select([
        "TO_CHAR(incidente.fechaHora, 'YYYY-MM') as mes",
        'incidente.tipo',
        'incidente.estado',
        'COUNT(*) as cantidad',
      ])
      .groupBy("TO_CHAR(incidente.fechaHora, 'YYYY-MM')")
      .addGroupBy('incidente.tipo')
      .addGroupBy('incidente.estado')
      .orderBy("TO_CHAR(incidente.fechaHora, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Agrupar por mes
    const agrupados: Record<string, any> = {};
    incidentes.forEach((item) => {
      if (!agrupados[item.mes]) {
        agrupados[item.mes] = {
          mes: item.mes,
          por_tipo: {} as Record<string, number>,
          por_estado: {} as Record<string, number>,
        };
      }
      agrupados[item.mes].por_tipo[item.tipo] =
        (agrupados[item.mes].por_tipo[item.tipo] || 0) + parseInt(item.cantidad);
      agrupados[item.mes].por_estado[item.estado] =
        (agrupados[item.mes].por_estado[item.estado] || 0) + parseInt(item.cantidad);
    });

    return Object.values(agrupados);
  }

  async getAnalisisCausas(
    empresaId: string,
    sede?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (sede) {
      where.areaTrabajo = sede;
    }
    if (fechaDesde && fechaHasta) {
      where.fechaHora = Between(fechaDesde, fechaHasta);
    }

    const incidentes = await this.incidenteRepository.find({
      where,
      select: ['causas'],
    });

    // Agrupar por causas (asumiendo que el campo causas contiene texto libre)
    const causasCount: Record<string, number> = {};
    incidentes.forEach((inc) => {
      if (inc.causas) {
        // Si hay múltiples causas separadas por comas o saltos de línea
        const causasArray = inc.causas
          .split(/[,;\n]/)
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
        causasArray.forEach((causa) => {
          causasCount[causa] = (causasCount[causa] || 0) + 1;
        });
      } else {
        causasCount['Sin causa registrada'] =
          (causasCount['Sin causa registrada'] || 0) + 1;
      }
    });

    return Object.entries(causasCount)
      .map(([causa, cantidad]) => ({ causa, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  async getDistribucionDemografica(
    empresaId: string,
    sede?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (sede) {
      where.areaTrabajo = sede;
    }
    if (fechaDesde && fechaHasta) {
      where.fechaHora = Between(fechaDesde, fechaHasta);
    }

    const incidentes = await this.incidenteRepository.find({
      where,
      relations: ['area', 'trabajadorAfectado'],
    });

    const porUnidad: Record<string, number> = {};
    const porArea: Record<string, number> = {};
    const porSede: Record<string, number> = {};

    incidentes.forEach((inc) => {
      // Por sede (areaTrabajo)
      const sedeNombre = inc.areaTrabajo || 'Sin sede';
      porSede[sedeNombre] = (porSede[sedeNombre] || 0) + 1;

      // Por área
      const areaNombre = inc.area?.nombre || 'Sin área';
      porArea[areaNombre] = (porArea[areaNombre] || 0) + 1;

      // Por unidad (asumiendo que está en areaTrabajo o área)
      const unidadNombre = inc.areaTrabajo || inc.area?.nombre || 'Sin unidad';
      porUnidad[unidadNombre] = (porUnidad[unidadNombre] || 0) + 1;
    });

    return {
      por_unidad: Object.entries(porUnidad).map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
      })),
      por_area: Object.entries(porArea).map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
      })),
      por_sede: Object.entries(porSede).map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
      })),
    };
  }

  async getPartesCuerpoLesionado(
    empresaId: string,
    sede?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (sede) {
      where.areaTrabajo = sede;
    }
    if (fechaDesde && fechaHasta) {
      where.fechaHora = Between(fechaDesde, fechaHasta);
    }

    const incidentes = await this.incidenteRepository.find({
      where,
      select: ['parteCuerpoAfectada'],
    });

    const partesCount: Record<string, number> = {};
    incidentes.forEach((inc) => {
      const parte = inc.parteCuerpoAfectada || 'No especificado';
      partesCount[parte] = (partesCount[parte] || 0) + 1;
    });

    return Object.entries(partesCount)
      .map(([parte, cantidad]) => ({ parte, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  async getMedidasCorrectivasPorIncidente(
    empresaId: string,
    sede?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const whereIncidente: any = { empresaId };
    if (sede) {
      whereIncidente.areaTrabajo = sede;
    }
    if (fechaDesde && fechaHasta) {
      whereIncidente.fechaHora = Between(fechaDesde, fechaHasta);
    }

    // Obtener incidentes en el rango
    const incidentes = await this.incidenteRepository.find({
      where: whereIncidente,
      select: ['id'],
    });

    const incidenteIds = incidentes.map((inc) => inc.id);

    if (incidenteIds.length === 0) {
      return {
        por_estado: [],
        tendencia_mensual: [],
      };
    }

    // Obtener medidas correctivas relacionadas
    const medidas = await this.accionCorrectivaRepository
      .createQueryBuilder('medida')
      .where('medida.incidenteId IN (:...incidenteIds)', { incidenteIds })
      .getMany();

    // Por estado
    const porEstado: Record<string, number> = {};
    medidas.forEach((medida) => {
      porEstado[medida.estado] = (porEstado[medida.estado] || 0) + 1;
    });

    // Tendencia mensual de aprobadas
    const aprobadas = medidas.filter(
      (m) => m.estado === EstadoAccion.Aprobado,
    );
    const tendenciaMensual: Record<string, number> = {};
    aprobadas.forEach((medida) => {
      const fecha = new Date(medida.fechaAprobacion || medida.fechaProgramada);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      tendenciaMensual[mes] = (tendenciaMensual[mes] || 0) + 1;
    });

    return {
      por_estado: Object.entries(porEstado).map(([estado, cantidad]) => ({
        estado,
        cantidad,
      })),
      tendencia_mensual: Object.entries(tendenciaMensual)
        .map(([mes, cantidad]) => ({ mes, cantidad }))
        .sort((a, b) => a.mes.localeCompare(b.mes)),
    };
  }

  async getImpactoOperativoDiasDescanso(
    empresaId: string,
    sede?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (sede) {
      where.areaTrabajo = sede;
    }
    if (fechaDesde && fechaHasta) {
      where.fechaHora = Between(fechaDesde, fechaHasta);
    }

    const incidentes = await this.incidenteRepository.find({
      where,
      relations: ['area'],
      select: ['diasPerdidos', 'area'],
    });

    const porUnidad: Record<string, { total: number; cantidad: number }> = {};
    const porArea: Record<string, { total: number; cantidad: number }> = {};

    incidentes.forEach((inc) => {
      const unidadNombre = inc.areaTrabajo || 'Sin unidad';
      if (!porUnidad[unidadNombre]) {
        porUnidad[unidadNombre] = { total: 0, cantidad: 0 };
      }
      porUnidad[unidadNombre].total += inc.diasPerdidos || 0;
      porUnidad[unidadNombre].cantidad += 1;

      const areaNombre = inc.area?.nombre || 'Sin área';
      if (!porArea[areaNombre]) {
        porArea[areaNombre] = { total: 0, cantidad: 0 };
      }
      porArea[areaNombre].total += inc.diasPerdidos || 0;
      porArea[areaNombre].cantidad += 1;
    });

    return {
      por_unidad: Object.entries(porUnidad).map(([nombre, datos]) => ({
        nombre,
        total_dias: datos.total,
        cantidad_eventos: datos.cantidad,
        promedio_dias: datos.cantidad > 0 ? datos.total / datos.cantidad : 0,
      })),
      por_area: Object.entries(porArea).map(([nombre, datos]) => ({
        nombre,
        total_dias: datos.total,
        cantidad_eventos: datos.cantidad,
        promedio_dias: datos.cantidad > 0 ? datos.total / datos.cantidad : 0,
      })),
    };
  }

  async getRankingSiniestralidad(
    empresaId: string,
    sede?: string,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: any = { empresaId };
    if (sede) {
      where.areaTrabajo = sede;
    }
    if (fechaDesde && fechaHasta) {
      where.fechaHora = Between(fechaDesde, fechaHasta);
    }

    const incidentes = await this.incidenteRepository.find({
      where,
      relations: ['trabajadorAfectado', 'area'],
      select: [
        'trabajadorAfectadoId',
        'diasPerdidos',
        'trabajadorAfectado',
        'area',
      ],
    });

    const ranking: Record<
      string,
      {
        trabajador_id: string;
        nombre: string;
        documento: string;
        unidad: string;
        area: string;
        sede: string;
        total_dias_descanso: number;
        cantidad_eventos: number;
      }
    > = {};

    incidentes.forEach((inc) => {
      if (!inc.trabajadorAfectadoId) return;

      const trabajadorId = inc.trabajadorAfectadoId;
      if (!ranking[trabajadorId]) {
        ranking[trabajadorId] = {
          trabajador_id: trabajadorId,
          nombre:
            inc.trabajadorAfectado?.nombreCompleto ||
            inc.nombreTrabajadorSnapshot ||
            'Sin nombre',
          documento:
            inc.trabajadorAfectado?.documentoIdentidad || 'Sin documento',
          unidad: inc.areaTrabajo || 'Sin unidad',
          area: inc.area?.nombre || 'Sin área',
          sede: inc.areaTrabajo || 'Sin sede',
          total_dias_descanso: 0,
          cantidad_eventos: 0,
        };
      }

      ranking[trabajadorId].total_dias_descanso += inc.diasPerdidos || 0;
      ranking[trabajadorId].cantidad_eventos += 1;
    });

    return Object.values(ranking)
      .sort((a, b) => b.cantidad_eventos - a.cantidad_eventos)
      .slice(0, 20); // Top 20
  }

  async getEstadisticaHistoricaRACS(
    empresaId: string,
    sede?: string,
  ) {
    const where: any = { empresaId };
    if (sede) {
      where.areaTrabajo = sede;
    }

    const incidentes = await this.incidenteRepository.find({
      where,
      select: ['fechaHora', 'tipo'],
    });

    const porAnio: Record<
      string,
      Record<string, number>
    > = {};

    incidentes.forEach((inc) => {
      const anio = new Date(inc.fechaHora).getFullYear().toString();
      if (!porAnio[anio]) {
        porAnio[anio] = {
          Ocupacional: 0,
          Propiedad: 0,
          Ambiente: 0,
          Otros: 0,
        };
      }

      // Mapear tipos de incidente a categorías RACS
      if (inc.tipo === TipoIncidente.Accidente) {
        porAnio[anio].Ocupacional += 1;
      } else if (inc.tipo === TipoIncidente.EnfermedadOcupacional) {
        porAnio[anio].Ocupacional += 1;
      } else {
        porAnio[anio].Otros += 1;
      }
    });

    return Object.entries(porAnio)
      .map(([anio, tipos]) => ({
        anio: parseInt(anio),
        ocupacional: tipos.Ocupacional,
        propiedad: tipos.Propiedad,
        ambiente: tipos.Ambiente,
        otros: tipos.Otros,
        total: tipos.Ocupacional + tipos.Propiedad + tipos.Ambiente + tipos.Otros,
      }))
      .sort((a, b) => b.anio - a.anio);
  }
}
