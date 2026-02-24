import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsDateString,
  IsUrl,
  ValidateIf,
  MinLength,
  IsInt,
  Min,
} from 'class-validator';
import { EstadoTrabajador, GrupoSanguineo, TipoDocumento, EstadoCivil, GradoInstruccion } from '../entities/trabajador.entity';

export class CreateTrabajadorDto {
  @IsString()
  nombres: string;

  @IsString()
  apellido_paterno: string;

  @IsString()
  apellido_materno: string;

  @IsEnum(TipoDocumento, { message: 'tipo_documento debe ser DNI, CARNE_EXTRANJERIA o PASAPORTE' })
  tipo_documento: TipoDocumento;

  @IsString()
  @MinLength(1, { message: 'El número de documento es obligatorio' })
  numero_documento: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsUUID()
  cargo_id?: string;

  @IsOptional()
  @IsUUID()
  area_id?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  email_corporativo?: string;

  @IsString()
  @IsDateString()
  fecha_ingreso: string;

  @IsOptional()
  @IsEnum(EstadoTrabajador)
  estado?: EstadoTrabajador = EstadoTrabajador.Activo;

  @IsOptional()
  @IsEnum(GrupoSanguineo)
  grupo_sanguineo?: GrupoSanguineo;

  @IsOptional()
  @IsString()
  contacto_emergencia_nombre?: string;

  @IsOptional()
  @IsString()
  contacto_emergencia_telefono?: string;

  @IsOptional()
  @ValidateIf((o) => o.foto_url !== '' && o.foto_url !== null && o.foto_url !== undefined)
  @IsUrl({}, { message: 'La foto debe ser una URL válida' })
  foto_url?: string;

  @IsOptional()
  @IsString()
  sede?: string;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsString()
  jefe_directo?: string;

  @IsOptional()
  @IsString()
  centro_costos?: string;

  @IsOptional()
  @IsString()
  nivel_exposicion?: string;

  @IsOptional()
  @IsString()
  tipo_usuario?: string;

  @IsOptional()
  @IsString()
  seguro_atencion_medica?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  distrito?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  numero_interior?: string;

  @IsOptional()
  @IsString()
  urbanizacion?: string;

  @IsOptional()
  @IsBoolean()
  reside_en_lugar_trabajo?: boolean;

  @IsOptional()
  @IsString()
  tiempo_residencia_lugar_trabajo?: string;

  @IsOptional()
  @IsEnum(EstadoCivil)
  estado_civil?: EstadoCivil;

  @IsOptional()
  @IsEnum(GradoInstruccion)
  grado_instruccion?: GradoInstruccion;

  @IsOptional()
  @IsInt()
  @Min(0)
  nro_hijos_vivos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  nro_dependientes?: number;

  @IsOptional()
  @IsBoolean()
  seguro_essalud?: boolean;

  @IsOptional()
  @IsBoolean()
  seguro_eps?: boolean;

  @IsOptional()
  @IsBoolean()
  seguro_sctr?: boolean;

  @IsOptional()
  @IsString()
  seguro_otro?: string;

  @IsOptional()
  @IsString()
  modalidad_contrato?: string;

  @IsOptional()
  @IsString()
  gerencia?: string;

  @IsOptional()
  @IsString()
  puesto_capacitacion?: string;

  @IsOptional()
  @IsString()
  protocolos_emo?: string;

  @IsOptional()
  @IsString()
  talla_casco?: string;

  @IsOptional()
  @IsString()
  talla_camisa?: string;

  @IsOptional()
  @IsString()
  talla_pantalon?: string;

  @IsOptional()
  @IsString()
  talla_calzado?: string;

  @IsOptional()
  perfil_completado?: boolean;

  @IsUUID()
  empresa_id: string;

  @IsOptional()
  @IsBoolean()
  acceso_todas_empresas?: boolean;
}
