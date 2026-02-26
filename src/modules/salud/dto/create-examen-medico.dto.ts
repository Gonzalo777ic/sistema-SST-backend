import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsUrl,
  IsArray,
} from 'class-validator';
import { TipoExamen, ResultadoExamen, EstadoExamen } from '../entities/examen-medico.entity';

export class CreateExamenMedicoDto {
  @IsUUID()
  trabajador_id: string;

  @IsEnum(TipoExamen)
  tipo_examen: TipoExamen;

  @IsString()
  @IsDateString()
  fecha_programada: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  fecha_realizado?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  fecha_vencimiento?: string;

  @IsString()
  centro_medico: string;

  @IsOptional()
  @IsString()
  medico_evaluador?: string;

  @IsOptional()
  @IsString()
  hora_programacion?: string;

  @IsOptional()
  @IsUUID()
  perfil_emo_id?: string;

  @IsOptional()
  @IsString()
  proyecto?: string;

  @IsOptional()
  @IsString()
  adicionales?: string;

  @IsOptional()
  @IsString()
  recomendaciones_personalizadas?: string;

  @IsOptional()
  @IsEnum(ResultadoExamen)
  resultado?: ResultadoExamen;

  @IsOptional()
  @IsString()
  restricciones?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  diagnosticos_cie10?: Array<{ code: string; description: string; tipo?: 'P' | 'D' | 'R' }>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programas_vigilancia?: string[];

  @IsOptional()
  evaluacion_clinica?: {
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
    /** Resumen clínico del médico sobre el hallazgo principal (estado, no orden) */
    conclusiones?: string;
    /** Instrucciones para el trabajador (qué debe hacer para cuidar su salud) */
    recomendaciones?: string;
    /** Borrador de Ficha Anexo 02 (Sección I) - persistido al guardar desde formulario */
    fichaAnexo02?: Record<string, unknown>;
    /** Filiación del trabajador (Sección II) - persistido al guardar desde formulario */
    filiacion?: Record<string, unknown>;
  };

  @IsOptional()
  @IsUrl()
  resultado_archivo_url?: string;

  @IsOptional()
  @IsEnum(EstadoExamen)
  estado?: EstadoExamen;

  @IsUUID()
  cargado_por_id: string;
}
