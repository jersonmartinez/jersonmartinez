/**
 * Resolutor de contenido localizado.
 *
 * Toma los datos en español de `src/data/portfolio.js`, les superpone el inglés
 * de `content.en.ts` y devuelve las mismas formas que ya consumen los
 * componentes, de modo que ninguno necesita saber en qué idioma se renderiza.
 *
 * Además de traducir el texto, TRASLADA LOS ENLACES INTERNOS del propio dato
 * (`relatedHref`, `collaborationModes[].href`, `valueProps[].href`,
 * `experience[].related[].href`, el `href` de un dato de cabecera). Sin esto,
 * un lector en inglés que pulsara «See experience» caería en la página
 * española: el enlace es contenido, no decoración.
 *
 * El español no paga nada por existir el inglés: con `lang === 'es'` las
 * funciones devuelven el dato original sin copiarlo ni recorrerlo.
 */

import {
  audienceMetrics, certifications, collaborationModes, contentMeta, courses, cvLinks,
  experience, methodologies, openWebinarsCourses, profile, projects, skills, teaching,
  valueProps, writing, youtubeChannels,
} from '../data/portfolio.js';
import type { Certification, Course, Project, Skill, ValueProp, WritingOutlet } from '../types/content';
import { DEFAULT_LOCALE, localizePath, type Lang } from './config';
import {
  audienceMetricsEn, collaborationEn, coursesEn, cvLabelsEn, experienceEn, experienceLedeEn,
  outletsEn, profileEn, projectsEn, skillsEn, teachingCtaEn, valuePropsEn, writingEn,
} from './content.en';

/** Metadatos de contenido (fechas de revisión); no dependen del idioma. */
export { contentMeta, certifications, methodologies, openWebinarsCourses };

export interface LocalizedProfileFact {
  value: string;
  label: string;
  href?: string;
  linkLabel?: string;
  external?: boolean;
}

export interface CollaborationMode {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: string;
}

export interface ExperienceEntry {
  id: string;
  start: string;
  period: string;
  role: string;
  company: string;
  description: string;
  context?: string;
  related: { label: string; href: string }[];
}

export interface TeachingEntry {
  name: string;
  logo: string;
  metrics: string[];
  description: string;
  cta: string;
  href: string;
}

export interface ChannelEntry {
  name: string;
  logo: string;
  metric: string;
  description: string;
  href: string;
  cta: string;
}

export interface CvLink {
  label: string;
  href: string;
  downloadHref: string;
  lang: string;
}

type FactMeta = { source?: string; href?: string; label?: string; external?: boolean };

/** Perfil con el texto y los enlaces del idioma pedido. */
export function getProfile(lang: Lang) {
  const en = lang !== DEFAULT_LOCALE;
  const facts: LocalizedProfileFact[] = (profile.facts as [string, string, FactMeta?][]).map(
    ([value, label, meta], index) => {
      const href = meta?.href ? localizePath(meta.href, lang) : undefined;
      const linkLabel = meta?.href
        ? (en ? profileEn.factMetaLabels[meta.href] || meta.label : meta.label)
        : undefined;
      return {
        value,
        label: en ? profileEn.factLabels[index] ?? label : label,
        ...(href ? { href } : {}),
        ...(linkLabel ? { linkLabel } : {}),
        ...(meta?.external ? { external: true } : {}),
      };
    },
  );
  return {
    ...profile,
    location: en ? profileEn.location : profile.location,
    headline: en ? profileEn.headline : profile.headline,
    intro: en ? profileEn.intro : profile.intro,
    facts,
  };
}

/** Entradilla de la trayectoria, que interpola los años de experiencia. */
export function getExperienceLede(lang: Lang): string {
  const years = profile.yearsExperience as number;
  return lang === DEFAULT_LOCALE
    ? `Más de ${years} años conectando proyectos tecnológicos, formación, ingeniería, automatización y estrategia cloud.`
    : experienceLedeEn(years);
}

/** Métricas de audiencia con su etiqueta traducida. */
export function getAudienceMetrics(lang: Lang) {
  if (lang === DEFAULT_LOCALE) return audienceMetrics;
  const out: Record<string, { label: string; longLabel?: string }> = {};
  for (const [key, value] of Object.entries(audienceMetrics as Record<string, { label: string; longLabel?: string }>)) {
    const override = audienceMetricsEn[key];
    out[key] = {
      ...value,
      label: override?.label ?? value.label,
      ...(value.longLabel ? { longLabel: override?.longLabel ?? value.longLabel } : {}),
    };
  }
  return out as typeof audienceMetrics;
}

/**
 * Skills localizados. Se conserva `key` con el nombre español porque
 * `getStackGroups` selecciona por él: filtrar por el nombre traducido ataría la
 * selección al idioma y dejaría la versión inglesa sin grupos.
 */
export function getSkills(lang: Lang): (Skill & { key: string })[] {
  return (skills as Skill[]).map((skill) => {
    const base = { ...skill, key: skill.name, relatedHref: localizePath(skill.relatedHref, lang) };
    if (lang === DEFAULT_LOCALE) return base;
    const override = skillsEn[skill.name];
    if (!override) return base;
    return {
      ...base,
      name: override.name,
      summary: override.summary,
      evidence: override.evidence,
      relatedLabel: override.relatedLabel,
      items: override.items ?? skill.items,
    };
  });
}

const STACK_GROUP_KEYS = ['Cloud', 'Contenedores', 'IaC', 'DevOps & CI/CD', 'Observabilidad', 'Desarrollo', 'Bases de datos'];

/** Grupos del stack, seleccionados por clave neutra y mostrados traducidos. */
export function getStackGroups(lang: Lang): { name: string; items: string[] }[] {
  return getSkills(lang)
    .filter((skill) => STACK_GROUP_KEYS.includes(skill.key))
    .map(({ name, items }) => ({ name, items }));
}

/** Proyectos localizados (los nombres propios no se traducen). */
export function getProjects(lang: Lang): Project[] {
  if (lang === DEFAULT_LOCALE) return projects as Project[];
  return (projects as Project[]).map((project) => {
    const override = projectsEn[project.name];
    return override ? { ...project, ...override } : project;
  });
}

/** Trayectoria localizada, con las etiquetas de sus enlaces relacionados. */
export function getExperience(lang: Lang): ExperienceEntry[] {
  type RawExperience = Omit<ExperienceEntry, 'related'> & { related?: { label: string; href: string }[] };
  return (experience as RawExperience[]).map((item) => {
    const override = lang === DEFAULT_LOCALE ? undefined : experienceEn[item.id];
    const related = (item.related ?? []).map((link, index) => ({
      label: override?.relatedLabels?.[index] ?? link.label,
      href: localizePath(link.href, lang),
    }));
    if (!override) return { ...item, related };
    return {
      ...item,
      period: override.period,
      role: override.role,
      description: override.description,
      ...(item.context ? { context: override.context ?? item.context } : {}),
      related,
    };
  });
}

/** Cursos localizados; el título se conserva porque el curso es en español. */
export function getCourses(lang: Lang): Course[] {
  if (lang === DEFAULT_LOCALE) return courses as Course[];
  return (courses as Course[]).map((course) => {
    const override = coursesEn[course.name];
    return override
      ? { ...course, ...override, framework: override.framework ?? course.framework }
      : course;
  });
}

/** Plataformas de enseñanza, con sus métricas ya traducidas. */
export function getTeaching(lang: Lang): TeachingEntry[] {
  const metrics = getAudienceMetrics(lang) as Record<string, { label: string }>;
  const metricByEs = new Map(
    Object.keys(audienceMetrics).map((key) => [
      (audienceMetrics as Record<string, { label: string }>)[key].label,
      metrics[key].label,
    ]),
  );
  return (teaching as TeachingEntry[]).map((item) => {
    const localizedMetrics = item.metrics.map((metric) => metricByEs.get(metric) ?? metric);
    if (lang === DEFAULT_LOCALE) return { ...item, metrics: localizedMetrics };
    const override = outletsEn[item.name];
    return {
      ...item,
      metrics: localizedMetrics,
      description: override?.description ?? item.description,
      cta: teachingCtaEn[item.name] ?? item.cta,
    };
  });
}

/** Canales de YouTube con su métrica traducida. */
export function getChannels(lang: Lang): ChannelEntry[] {
  const metrics = getAudienceMetrics(lang) as Record<string, { label: string }>;
  const metricByEs = new Map(
    Object.keys(audienceMetrics).map((key) => [
      (audienceMetrics as Record<string, { label: string }>)[key].label,
      metrics[key].label,
    ]),
  );
  return (youtubeChannels as ChannelEntry[]).map((channel) => {
    const metric = metricByEs.get(channel.metric) ?? channel.metric;
    if (lang === DEFAULT_LOCALE) return { ...channel, metric };
    const override = outletsEn[channel.name];
    return {
      ...channel,
      metric,
      description: override?.description ?? channel.description,
      cta: override?.cta ?? channel.cta,
    };
  });
}

/** Faceta de escritura: encabezados, temas y medios. */
export function getWriting(lang: Lang) {
  const metrics = getAudienceMetrics(lang) as Record<string, { label: string }>;
  const raw = writing as { kicker: string; title: string; lede: string; topics: string[]; outlets: WritingOutlet[] };
  const outlets: WritingOutlet[] = raw.outlets.map((outlet) => {
    const metric = outlet.metric ? metrics.openWebinarsArticles.label : undefined;
    if (lang === DEFAULT_LOCALE) return { ...outlet, ...(metric ? { metric } : {}) };
    const override = outletsEn[outlet.name];
    return {
      ...outlet,
      ...(metric ? { metric } : {}),
      role: override?.role ?? outlet.role,
      description: override?.description ?? outlet.description,
      cta: override?.cta ?? outlet.cta,
    };
  });
  if (lang === DEFAULT_LOCALE) return { ...raw, outlets };
  return { ...writingEn, outlets };
}

/** Proof points de valor, con su enlace al contexto ya localizado. */
export function getValueProps(lang: Lang): ValueProp[] {
  return (valueProps as ValueProp[]).map((prop) => {
    const href = localizePath(prop.href, lang);
    if (lang === DEFAULT_LOCALE) return { ...prop, href };
    const override = valuePropsEn[prop.metric];
    return override ? { ...prop, ...override, href } : { ...prop, href };
  });
}

/** Modos de colaboración con título, descripción, CTA y enlace localizados. */
export function getCollaborationModes(lang: Lang): CollaborationMode[] {
  return (collaborationModes as CollaborationMode[]).map((mode) => {
    const href = localizePath(mode.href, lang);
    if (lang === DEFAULT_LOCALE) return { ...mode, href };
    const override = collaborationEn[mode.icon];
    return override ? { ...mode, ...override, href } : { ...mode, href };
  });
}

/** Enlaces al CV; los documentos son los mismos, sólo cambia su etiqueta. */
export function getCvLinks(lang: Lang): CvLink[] {
  return (cvLinks as CvLink[]).map((cv) =>
    lang === DEFAULT_LOCALE ? cv : { ...cv, label: cvLabelsEn[cv.lang] ?? cv.label },
  );
}

/** Certificaciones: nombres y niveles oficiales, idénticos en los dos idiomas. */
export function getCertifications(): Certification[] {
  return certifications as Certification[];
}
