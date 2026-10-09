/**
 * Formas de los datos de `src/data/portfolio.ts`, declaradas una sola vez.
 *
 * Son el ÚNICO hogar de cada forma del contenido, y el dato las declara: cada
 * export de `portfolio.ts` lleva su anotación, de modo que el compilador verifica
 * el dato CONTRA este contrato. Antes el dato vivía en JavaScript y el resolutor
 * de i18n afirmaba las formas a mano (`as Skill[]`, `as Project[]`, ...): esas
 * aserciones no se comprueban, así que un dato desviado del tipo no lo cazaba
 * nadie y `astro check` seguía en 0. Quien edita el portfolio sigue escribiendo
 * objetos literales, no tipos; lo único que cambió es que ahora se validan.
 *
 * También sirven para que `astro check` verifique los límites de cada componente:
 * al destructurar `Astro.props` sin interfaz todo era `any` y los parámetros de
 * los `.map()` heredaban ese `any` en silencio.
 *
 * Los campos opcionales lo son porque el dato real varía entre entradas (por ejemplo,
 * un proyecto propio no declara `language` ni `license`).
 */

/** Una credencial concreta dentro de un emisor. */
export interface CredentialItem {
  name: string;
  code: string;
  level: string;
  credentialId: string;
  href: string;
}

/** Grupo de credenciales de un mismo emisor oficial. */
export interface Certification {
  provider: string;
  logo: string;
  issuerUrl: string;
  items: CredentialItem[];
}

/** Capacidad aplicada con su evidencia y enlace de respaldo. */
export interface Skill {
  name: string;
  icon: string;
  summary: string;
  evidence: string;
  items: string[];
  relatedHref: string;
  relatedLabel: string;
}

/** Proyecto o repositorio presentado como caso. */
export interface Project {
  name: string;
  kind: string;
  categories: string[];
  theme: string;
  description: string;
  role: string;
  problem: string;
  contribution: string;
  outcome: string;
  tags: string[];
  cta?: string;
  href?: string;
  featured?: boolean;
  language?: string;
  license?: string;
  updatedAt?: string;
}

/** Etapa de la ruta de aprendizaje. */
export interface Course {
  name: string;
  framework: string;
  visual: string;
  pathStep: number;
  summary: string;
  outcome: string;
  access: string;
  /** Sólo la etapa gratuita lo declara; el resto de cursos omite el campo. */
  free?: boolean;
  href: string;
}

/** Elemento con logotipo y nombre (ecosistema tecnológico, plataformas de enseñanza). */
export interface LogoItem {
  name: string;
  logo: string;
}

/** Entrada de miga de pan: [nombre visible, ruta]. */
export type BreadcrumbEntry = [string, string];

/** Medio o espacio donde se publica contenido escrito. */
export interface WritingOutlet {
  name: string;
  role: string;
  metric?: string;
  description: string;
  href: string;
  cta: string;
  external?: boolean;
}

/** Proof point de valor de negocio con su contexto verificable. */
export interface ValueProp {
  metric: string;
  label: string;
  detail: string;
  href: string;
}

// --- Formas del dato que antes se afirmaban con `as` ------------------------
//
// Viven aquí, y no en `src/i18n/content.ts`, para que exista UNA definición por
// forma: el dato la declara al exportar y el resolutor la consume al importar.

/** Fechas de las que derivan el sitemap, el gate de cabeceras y la suite. */
export interface ContentMeta {
  lastReviewed: string;
  careerStartYear: number;
  continuousLearningSince: string;
}

/**
 * Metadatos opcionales de un dato del perfil. `source` documenta de dónde sale
 * la cifra; `href`/`label` la enlazan a su respaldo.
 */
export interface FactMeta {
  source?: string;
  href?: string;
  label?: string;
  external?: boolean;
}

/** Dato del perfil: [valor, etiqueta, metadatos opcionales]. */
export type ProfileFact = [string, string, FactMeta?];

/** Identidad, contacto y cifras de cabecera. */
export interface Profile {
  name: string;
  location: string;
  email: string;
  website: string;
  github: string;
  linkedin: string;
  whatsapp: string;
  headline: string;
  intro: string;
  yearsExperience: number;
  facts: ProfileFact[];
}

/** Dato del perfil ya localizado, con su enlace trasladado al idioma. */
export interface LocalizedProfileFact {
  value: string;
  label: string;
  href?: string;
  linkLabel?: string;
  external?: boolean;
}

/** Métrica de audiencia con la fecha y el origen de su verificación. */
export interface AudienceMetric {
  label: string;
  /** Sólo Udemy la declara, para el texto largo del hero. */
  longLabel?: string;
  lastVerifiedAt: string;
  source: string;
}

/** Claves de audiencia. Nombrarlas evita indexar el registro con `string`. */
export type AudienceMetricKey =
  | 'udemy'
  | 'devopsea'
  | 'sideMaster'
  | 'openWebinarsArticles'
  | 'openWebinarsCourses';

export type AudienceMetrics = Record<AudienceMetricKey, AudienceMetric>;

/** Enlace de contexto que acompaña a una etapa de la trayectoria. */
export interface RelatedLink {
  label: string;
  href: string;
}

/** Etapa de la trayectoria tal como la declara el dato. */
export interface ExperienceRecord {
  id: string;
  start: string;
  /** `null` en los roles vigentes. */
  end: string | null;
  period: string;
  role: string;
  company: string;
  description: string;
  context?: string;
  related?: RelatedLink[];
}

/** Etapa ya localizada: `related` queda siempre resuelto. */
export interface ExperienceEntry extends Omit<ExperienceRecord, 'related'> {
  related: RelatedLink[];
}

/** Grupo del stack mostrado en «sobre mí». */
export interface StackGroup {
  name: string;
  items: string[];
}

/** Curso alojado en OpenWebinars. */
export interface OpenWebinarsCourse {
  name: string;
  duration: string;
  /** Sólo los cursos con valoración pública la declaran. */
  rating?: string;
  href: string;
}

/** Canal de YouTube con su métrica de audiencia. */
export interface ChannelEntry {
  name: string;
  logo: string;
  metric: string;
  description: string;
  href: string;
  cta: string;
}

/** Plataforma de enseñanza con una o varias métricas. */
export interface TeachingEntry {
  name: string;
  logo: string;
  metrics: string[];
  description: string;
  cta: string;
  href: string;
}

/** Documento de CV, con su copia descargable y su idioma. */
export interface CvLink {
  label: string;
  href: string;
  downloadHref: string;
  lang: string;
}

/** Vía de colaboración ofrecida a empresas. */
export interface CollaborationMode {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: string;
}

/** Faceta de escritura: encabezados, temas y medios de publicación. */
export interface Writing {
  kicker: string;
  title: string;
  lede: string;
  topics: string[];
  outlets: WritingOutlet[];
}
