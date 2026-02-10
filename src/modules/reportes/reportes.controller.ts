import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('cumplimiento-capacitaciones')
  async getCumplimientoCapacitaciones(
    @Query('empresa_id') empresaId: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getCumplimientoCapacitaciones(
      empresaId,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes-vs-incidentes')
  async getAccidentesVsIncidentes(
    @Query('empresa_id') empresaId: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getAccidentesVsIncidentes(
      empresaId,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('medidas-correctivas')
  async getMedidasCorrectivas(
    @Query('empresa_id') empresaId: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getMedidasCorrectivas(
      empresaId,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('inspecciones-por-mes')
  async getInspeccionesPorMes(
    @Query('empresa_id') empresaId: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getInspeccionesPorMes(
      empresaId,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('porcentaje-levantamiento')
  async getPorcentajeLevantamiento(@Query('empresa_id') empresaId: string) {
    return this.reportesService.getPorcentajeLevantamientoAcciones(empresaId);
  }

  @Get('actos-condiciones')
  async getActosCondiciones(
    @Query('empresa_id') empresaId: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getActosCondiciones(
      empresaId,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  // ========== REPORTES DE ACCIDENTES E INCIDENTES ==========

  @Get('accidentes/dias-ultimo-incidente')
  async getDiasUltimoIncidente(
    @Query('empresa_id') empresaId: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getDiasDesdeUltimoIncidentePorSede(
      empresaId,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/tendencia-temporal')
  async getTendenciaTemporal(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getTendenciaTemporalIncidentes(
      empresaId,
      sede,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/analisis-causas')
  async getAnalisisCausas(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getAnalisisCausas(
      empresaId,
      sede,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/distribucion-demografica')
  async getDistribucionDemografica(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getDistribucionDemografica(
      empresaId,
      sede,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/partes-cuerpo')
  async getPartesCuerpo(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getPartesCuerpoLesionado(
      empresaId,
      sede,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/medidas-correctivas')
  async getMedidasCorrectivasIncidentes(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getMedidasCorrectivasPorIncidente(
      empresaId,
      sede,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/impacto-operativo')
  async getImpactoOperativo(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getImpactoOperativoDiasDescanso(
      empresaId,
      sede,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/ranking-siniestralidad')
  async getRankingSiniestralidad(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    return this.reportesService.getRankingSiniestralidad(
      empresaId,
      sede,
      fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta ? new Date(fechaHasta) : undefined,
    );
  }

  @Get('accidentes/estadistica-historica')
  async getEstadisticaHistorica(
    @Query('empresa_id') empresaId: string,
    @Query('sede') sede?: string,
  ) {
    return this.reportesService.getEstadisticaHistoricaRACS(
      empresaId,
      sede,
    );
  }
}
