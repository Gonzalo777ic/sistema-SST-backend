/**
 * Datos de seed para EPPs genéricos (empresa_id: null).
 *
 * Para agregar imágenes y fichas técnicas:
 * - imagen_url: pega la URL de la imagen del EPP (ej: https://storage.../imagen.jpg)
 * - adjunto_pdf_url: pega la URL del PDF de ficha técnica (opcional)
 * Deja '' para omitir o completar después desde la UI de edición.
 */
import {
  TipoProteccionEPP,
  CategoriaEPP,
  VigenciaEPP,
  CategoriaCriticidadEPP,
} from '../entities/epp.entity';

export interface EppSeedItem {
  nombre: string;
  descripcion: string;
  tipoProteccion: TipoProteccionEPP;
  categoria: CategoriaEPP;
  vigencia: VigenciaEPP;
  imagen_url?: string;
  adjunto_pdf_url?: string;
  categoriaCriticidad?: CategoriaCriticidadEPP;
}

export const eppSeedData: EppSeedItem[] = [
  // --- MANOS ---
  {
    nombre: 'GUANTES DE CUERO',
    descripcion: 'Guantes fabricados en cuero, ofrecen resistencia y durabilidad.',
    tipoProteccion: TipoProteccionEPP.Manos,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.SeisMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6d09a1f4744912c57f1710284402767.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'GUANTES DE CALOR - MANTENIMIENTO',
    descripcion: 'Guantes diseñados para resistir altas temperaturas',
    tipoProteccion: TipoProteccionEPP.Manos,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.CuatroMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6d09a1f4744912c5801709306080258.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'GUANTES LAVADO',
    descripcion:
      'Guantes resistentes al agua y productos químicos, diseñados para tareas de limpieza y lavado.',
    tipoProteccion: TipoProteccionEPP.Manos,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.TresMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5811706625365298.png',
    adjunto_pdf_url: '',
  },
  ...['S', 'M', 'L'].map((talla) => ({
    nombre: `GUANTES ANTICORTE, TALLA ${talla}`,
    descripcion:
      'Guantes diseñados para resistir cortes y abrasiones, ofreciendo protección contra objetos afilados.',
    tipoProteccion: TipoProteccionEPP.Manos,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.TresMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6d09a1f4744912c57e1706625146346.png',
    adjunto_pdf_url: '',
  })),
  ...['S', 'M', 'L'].map((talla) => ({
    nombre: `GUANTES SUPER FLEX, TALLA ${talla}`,
    descripcion:
      'Los guantes de protección SUPER FLEX de CLUTE recubiertos con látex corrugado, son los guantes de protección industrial de uso general, ideales para proteger a las personas de los procesos ofreciendo un excelente nivel de agarre, destreza y comodidad.',
    tipoProteccion: TipoProteccionEPP.Manos,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.DosMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6d09a1f4744912c57d1710284575952.png',
    adjunto_pdf_url: '',
  })),
  ...['S', 'M', 'L'].map((talla) => ({
    nombre: `GUANTES NITRILO, TALLA ${talla}`,
    descripcion: 'Guantes de nitrilo, resistentes a productos químicos y agentes patógenos.',
    tipoProteccion: TipoProteccionEPP.Manos,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.DosMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65f0e2352454b90008f263971710285368968.png',
    adjunto_pdf_url: '',
  })),
  {
    nombre: 'GUANTE DE CUERO MANGA LARGA PARA SOLDAR',
    descripcion: 'Guante de cuero con manga larga para proteger manos y antebrazos durante trabajos de soldadura.',
    tipoProteccion: TipoProteccionEPP.Manos,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.SeisMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/67229207006fe70009e263731730318859488.png', // Agregar URL de imagen
    adjunto_pdf_url: '',
  },

  // --- CABEZA ---
  {
    nombre: 'MASCARILLA CON FILTRO',
    descripcion:
      'Mascarilla con filtro, ofrece protección adicional contra partículas finas y contaminantes del aire. Indicada para entornos con riesgos respiratorios.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5831706626163907.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'PROTECTOR FACIAL',
    descripcion: 'Dispositivo que protege la cara contra salpicaduras, gotas y partículas.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5841706626083848.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'CASCO CON BARBIQUEJO',
    descripcion: 'Casco de seguridad con barbiquejo para garantizar un ajuste seguro.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6f09a1f4744912c58b1706624664156.jpg', // Agregar URL de imagen
    adjunto_pdf_url: '',
  },
  {
    nombre: 'BARBIQUEJO',
    descripcion: 'Cinta o correa que ajusta el casco bajo la barbilla para mantenerlo seguro en la cabeza.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/66743ca106e8570008fd6e901718893732677.png', // Agregar URL de imagen
    adjunto_pdf_url: '',
  },
  {
    nombre: 'CASCO CON OREJERA',
    descripcion:
      'Casco que integra orejeras para proporcionar protección adicional contra el ruido. Indicado en entornos con riesgos de lesiones en la cabeza y exposición a ruido.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6f09a1f4744912c58c1706624716608.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'GORRO',
    descripcion: 'Gorro para cubrirse la cabeza y cuello en lugares soleados.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.SeisMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65dfacc757f7a300084086b91709157576366.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'MICA PARA CARETA FACIAL',
    descripcion: 'Dispositivo que protege la cara contra salpicaduras, gotas y partículas.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65e1efe177f3a70008960b9c1709305828661.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'MASCARILLA FACIAL DESECHABLE',
    descripcion:
      'Mascarilla respiratoria filtra partículas del aire, proteger contra salpicaduras y reducir la propagación de agentes infecciosos.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnMes,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65e1f288dfc5a500085419911744405167781.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'MASCARILLA PARA SOLDAR',
    descripcion: 'Máscara de protección facial para soldadura, protege contra chispas, luz ultravioleta e infrarroja.',
    tipoProteccion: TipoProteccionEPP.Cabeza,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/672293cb006fe70009e263791730319308023.png', // Agregar URL de imagen
    adjunto_pdf_url: '',
  },

  // --- AUDITIVA ---
  {
    nombre: 'TAPONES AUDITIVOS',
    descripcion: 'Tapones diseñados para reducir la exposición al ruido.',
    tipoProteccion: TipoProteccionEPP.Auditiva,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.TresMeses,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5861706625490660.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'OREJERA TIPO VINCHA',
    descripcion: 'Dispositivo que cubre las orejas para proporcionar aislamiento acústico.',
    tipoProteccion: TipoProteccionEPP.Auditiva,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5871709306154658.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'OREJERA PARA CASCO',
    descripcion: 'Accesorio que se acopla al casco para proteger de ruido en entornos de alto nivel sonoro.',
    tipoProteccion: TipoProteccionEPP.Auditiva,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/667ecd7a4a7df900089b16e91719586174224.png', // Agregar URL de imagen
    adjunto_pdf_url: '',
  },

  // --- VISUAL ---
  {
    nombre: 'LENTE DE SEGURIDAD',
    descripcion:
      'Gafas diseñadas para proteger los ojos contra impactos, salpicaduras y partículas.',
    tipoProteccion: TipoProteccionEPP.Visual,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5881710953985727.png',
    adjunto_pdf_url: '',
  },
  {
    nombre: 'LENTE ANTIPARRA',
    descripcion:
      'Lente de protección que cubre toda la cara, diseñado para proteger contra salpicaduras, partículas y impactos.',
    tipoProteccion: TipoProteccionEPP.Visual,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5891706626256358.png',
    adjunto_pdf_url: '',
  },

  // --- CUERPO ---
  {
    nombre: 'ARNES DE SEGURIDAD',
    descripcion: 'Dispositivo que se coloca en el cuerpo para evitar caídas desde alturas elevadas.',
    tipoProteccion: TipoProteccionEPP.Cuerpo,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6f09a1f4744912c58a1706624910475.png',
    adjunto_pdf_url: '',
  },
  ...['S', 'M', 'L', 'XL', 'XXL'].map((talla) => ({
    nombre: `OVEROL IGNIFUGO, TALLA ${talla}`,
    descripcion:
      'Prenda de protección diseñada para brindar seguridad en entornos de trabajo donde existe riesgo de calor, llamas, soldaduras y cargas electrostáticas.',
    tipoProteccion: TipoProteccionEPP.Cuerpo,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65e23688a686360008e2b1cc1709323916051.png',
    adjunto_pdf_url: '',
  })),
  {
    nombre: 'MANDIL DE CUERO PARA SOLDAR',
    descripcion: 'Delantal de cuero para proteger el torso durante trabajos de soldadura.',
    tipoProteccion: TipoProteccionEPP.Cuerpo,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/672292c1006fe70009e263761730319042375.png', // Agregar URL de imagen
    adjunto_pdf_url: '',
  },
  ...['XS', 'S', 'M', 'L', 'XL'].map((talla) => ({
    nombre: `FAJA LUMBAR, TALLA ${talla}`,
    descripcion: 'Faja diseñada para proporcionar soporte a la región lumbar.',
    tipoProteccion: TipoProteccionEPP.Cuerpo,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6e09a1f4744912c5851706624782312.png',
    adjunto_pdf_url: '',
  })),

  // --- UNIFORMES (Cuerpo - Polos) ---
  ...['S', 'M', 'L', 'XL', 'XXL'].map((talla) => ({
    nombre: `POLO CUELLO REDONDO, TALLA ${talla}`,
    descripcion: 'Polo de manga corta con cuello redondo, cómodo y versátil.',
    tipoProteccion: TipoProteccionEPP.Cuerpo,
    categoria: CategoriaEPP.Uniforme,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6d09a1f4744912c57a1710334069951.png',
    adjunto_pdf_url: '',
  })),

  // --- UNIFORMES (Pierna - Pantalones) ---
  ...['26', '28', '30', '32', '34', '36', '38'].map((talla) => ({
    nombre: `PANTALON DRILL, TALLA ${talla}`,
    descripcion:
      'Pantalón fabricado con tejido drill resistente, proporciona protección contra abrasiones y rasgaduras.',
    tipoProteccion: TipoProteccionEPP.Pierna,
    categoria: CategoriaEPP.Uniforme,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef5809a1f4744912c5771706626358350.png',
    adjunto_pdf_url: '',
  })),

  // --- PIES (Botas) ---
  ...['37', '38', '39', '40', '41', '42', '43', '44', '45', '46'].map((talla) => ({
    nombre: `BOTA DE SEGURIDAD DIELÉCTRICA PUNTA DE ACERO, TALLA ${talla}`,
    descripcion: 'Bota con punta de acero para proteger los pies contra impactos y compresión.',
    tipoProteccion: TipoProteccionEPP.Pies,
    categoria: CategoriaEPP.EPP,
    vigencia: VigenciaEPP.UnAnio,
    imagen_url: 'https://backend-user-prod-assets-bucket.s3.amazonaws.com/fibrascortadas/firmas/65a7ef6d09a1f4744912c57c1710284046996.png',
    adjunto_pdf_url: '',
  })),
].map((item) => ({
  ...item,
  categoriaCriticidad: CategoriaCriticidadEPP.Core,
}));
