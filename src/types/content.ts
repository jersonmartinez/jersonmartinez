/**
 * Formas de los datos de `src/data/portfolio.js`, declaradas una sola vez.
 *
 * El dato sigue viviendo en JavaScript a propósito (quien edita el portfolio escribe
 * datos, no tipos), así que estas interfaces describen el CONTRATO que consumen los
 * componentes. Sirven para que `astro check` verifique de verdad los límites de cada
 * componente: antes, al destructurar `Astro.props` sin interfaz, todo era `any` y los
 * parámetros de los `.map()` heredaban ese `any` en silencio.
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
