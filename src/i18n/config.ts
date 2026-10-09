/**
 * Registro de idiomas y rutas del sitio.
 *
 * Decisiones de arquitectura, explícitas porque condicionan todo lo demás:
 *
 * 1. El español es el idioma por defecto y NO lleva prefijo: las URLs públicas
 *    existentes (`/`, `/projects.html`, …) no cambian ni un byte. El inglés vive
 *    bajo `/en`. Así no se rompe ningún enlace, marcador ni posicionamiento ya
 *    conseguido, que es la condición para que añadir un idioma sea seguro.
 *
 * 2. Los SEGMENTOS de ruta no se traducen (`/en/projects.html`, no
 *    `/en/proyectos`). Las rutas ya estaban en inglés, así que traducirlas sólo
 *    añadiría una tabla de equivalencias que mantener y rutas duplicadas que
 *    redirigir, sin ganancia para el lector.
 *
 * 3. No se usa la configuración `i18n` de Astro: con un idioma por defecto sin
 *    prefijo, su aportación serían unos helpers que aquí se resuelven con estas
 *    20 líneas, y en cambio introduce una capa de enrutado sobre ocho rutas que
 *    hoy funcionan. Cero dependencias y cero cambios en `astro.config.mjs`.
 */

export const LOCALES = ['es', 'en'] as const;
export type Lang = (typeof LOCALES)[number];

/** Idioma sin prefijo de ruta. */
export const DEFAULT_LOCALE: Lang = 'es';

/** Prefijo de ruta por idioma. El idioma por defecto no lleva ninguno. */
export const LOCALE_PREFIX: Record<Lang, string> = { es: '', en: '/en' };

/** Etiqueta del idioma en su propio idioma (para el conmutador). */
export const LOCALE_LABEL: Record<Lang, string> = { es: 'Español', en: 'English' };

/** `og:locale` por idioma. */
export const OG_LOCALE: Record<Lang, string> = { es: 'es_ES', en: 'en_US' };

/** Claves de ruta compartidas por los dos idiomas. */
export const ROUTE_KEYS = ['home', 'projects', 'courses', 'certifications', 'experience', 'about'] as const;
export type RouteKey = (typeof ROUTE_KEYS)[number];

/** Ruta canónica (español) de cada clave. El inglés es la misma bajo `/en`. */
export const ROUTE_PATHS: Record<RouteKey, string> = {
  home: '/',
  projects: '/projects.html',
  courses: '/courses.html',
  certifications: '/certifications.html',
  experience: '/experience.html',
  about: '/about.html',
};

const PAGE_PATHS = new Set<string>(Object.values(ROUTE_PATHS));

/**
 * Ruta pública de una clave en un idioma.
 * `home` en inglés es `/en` (no `/en/`), coherente con `trailingSlash: false`.
 */
export function routePath(key: RouteKey, lang: Lang): string {
  const base = ROUTE_PATHS[key];
  if (lang === DEFAULT_LOCALE) return base;
  return base === '/' ? LOCALE_PREFIX[lang] : `${LOCALE_PREFIX[lang]}${base}`;
}

/**
 * Traslada un href INTERNO al idioma dado.
 *
 * Sólo se prefijan las rutas de PÁGINA declaradas arriba: los assets
 * (`/cv/…pdf`, `/brands/…svg`, `/images/…`) son compartidos por los dos idiomas
 * y deben quedar intactos — prefijarlos daría 404. Las URLs externas, los
 * `mailto:`, `tel:` y los anclajes puros (`#seccion`) se devuelven sin tocar.
 *
 * Los fragmentos (`#hotaka-ikhodi`, `#proyecto-kiro-crew`) se conservan tal
 * cual: son IDENTIFICADORES derivados del dato (el `id` de una experiencia, el
 * slug de un proyecto), no texto visible, así que son iguales en los dos
 * idiomas y los enlaces cruzados siguen funcionando sin tabla de traducción.
 */
export function localizePath(href: string, lang: Lang): string {
  if (lang === DEFAULT_LOCALE) return href;
  if (!href || !href.startsWith('/')) return href;
  const hashAt = href.indexOf('#');
  const pathname = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : href.slice(hashAt);
  if (!PAGE_PATHS.has(pathname)) return href;
  const prefixed = pathname === '/' ? LOCALE_PREFIX[lang] : `${LOCALE_PREFIX[lang]}${pathname}`;
  return `${prefixed}${hash}`;
}

/**
 * Deduce el idioma y la clave de ruta desde un pathname del build.
 * Se usa en el layout para calcular los `hreflang` y la tarjeta social sin que
 * cada página tenga que repetir su identidad.
 */
export function parsePathname(pathname: string): { lang: Lang; key: RouteKey | null } {
  const clean = pathname.replace(/\/$/, '') || '/';
  const isEn = clean === '/en' || clean.startsWith('/en/');
  const lang: Lang = isEn ? 'en' : 'es';
  const bare = isEn ? clean.replace(/^\/en/, '') || '/' : clean;
  const normalized = bare === '' ? '/' : bare;
  const key = (ROUTE_KEYS.find((candidate) => ROUTE_PATHS[candidate] === normalized)
    || (normalized === '/index.html' ? 'home' : null)) as RouteKey | null;
  return { lang, key };
}

/** El otro idioma, para el conmutador del header. */
export function otherLang(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}
