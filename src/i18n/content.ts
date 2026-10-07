/**
 * Resolutor de contenido localizado.
 *
 * Toma los datos en español de `src/data/portfolio.ts`, les superpone el inglés
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
} from '../data/portfolio';
import type {
  AudienceMetricKey, AudienceMetrics, Certification, ChannelEntry, CollaborationMode, Course,
  CvLink, ExperienceEntry, LocalizedProfileFact, Project, Skill, StackGroup, TeachingEntry,
  ValueProp, Writing, WritingOutlet,
} from '../types/content';
import { DEFAULT_LOCALE, localizePath, type Lang } from './config';
import {
  audienceMetricsEn, collaborationEn, coursesEn, cvLabelsEn, experienceEn, experienceLedeEn,
  outletsEn, profileEn, projectsEn, skillsEn, teachingCtaEn, valuePropsEn, writingEn,
} from './content.en';

/** Metadatos de contenido (fechas de revisión); no dependen del idioma. */
export { contentMeta, certifications, methodologies, openWebinarsCourses };

/**
 * Las formas del contenido viven en `src/types/content.ts` y el dato las declara
 * al exportar, así que aquí sólo se consumen. Se re-exportan para que un
 * consumidor que ya importa este módulo no necesite una segunda ruta.
 */
export type {
  ChannelEntry, CollaborationMode, CvLink, ExperienceEntry, LocalizedProfileFact, TeachingEntry,
};

/** Perfil con el texto y los enlaces del idioma pedido. */
export function getProfile(lang: Lang) {
  const en = lang !== DEFAULT_LOCALE;
  const facts: LocalizedProfileFact[] = profile.facts.map(
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
  const years = profile.yearsExperience;
  return lang === DEFAULT_LOCALE
    ? `Más de ${years} años conectando proyectos tecnológicos, formación, ingeniería, automatización y estrategia cloud.`
    : experienceLedeEn(years);
}

/** Claves de audiencia, tipadas para poder indexar el registro sin `as`. */
const AUDIENCE_KEYS = Object.keys(audienceMetrics) as AudienceMetricKey[];

/** Métricas de audiencia con su etiqueta traducida. */
export function getAudienceMetrics(lang: Lang): AudienceMetrics {
  if (lang === DEFAULT_LOCALE) return audienceMetrics;
  const out = {} as AudienceMetrics;
  for (const key of AUDIENCE_KEYS) {
    const value = audienceMetrics[key];
    const override = audienceMetricsEn[key];
    out[key] = {
      ...value,
      label: override?.label ?? value.label,
      ...(value.longLabel ? { longLabel: override?.longLabel ?? value.longLabel } : {}),
    };
  }
  return out;
}

/**
 * Correspondencia entre la etiqueta española de cada métrica y la del idioma
 * pedido. La construyen `getTeaching` y `getChannels`, que traen las métricas
 * ya escritas en el dato en español.
 */
function metricTranslator(lang: Lang): Map<string, string> {
  const metrics = getAudienceMetrics(lang);
  return new Map(AUDIENCE_KEYS.map((key) => [audienceMetrics[key].label, metrics[key].label]));
}

/**
 * Skills localizados. Se conserva `key` con el nombre español porque
 * `getStackGroups` selecciona por él: filtrar por el nombre traducido ataría la
 * selección al idioma y dejaría la versión inglesa sin grupos.
 */
export function getSkills(lang: Lang): (Skill & { key: string })[] {
  return skills.map((skill) => {
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
export function getStackGroups(lang: Lang): StackGroup[] {
  return getSkills(lang)
    .filter((skill) => STACK_GROUP_KEYS.includes(skill.key))
    .map(({ name, items }) => ({ name, items }));
}

/** Proyectos localizados (los nombres propios no se traducen). */
export function getProjects(lang: Lang): Project[] {
  if (lang === DEFAULT_LOCALE) return projects;
  return projects.map((project) => {
    const override = projectsEn[project.name];
    return override ? { ...project, ...override } : project;
  });
}

/** Trayectoria localizada, con las etiquetas de sus enlaces relacionados. */
export function getExperience(lang: Lang): ExperienceEntry[] {
  return experience.map((item) => {
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
  if (lang === DEFAULT_LOCALE) return courses;
  return courses.map((course) => {
    const override = coursesEn[course.name];
    return override
      ? { ...course, ...override, framework: override.framework ?? course.framework }
      : course;
  });
}

/** Plataformas de enseñanza, con sus métricas ya traducidas. */
export function getTeaching(lang: Lang): TeachingEntry[] {
  const metricByEs = metricTranslator(lang);
  return teaching.map((item) => {
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
  const metricByEs = metricTranslator(lang);
  return youtubeChannels.map((channel) => {
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
export function getWriting(lang: Lang): Writing {
  const metrics = getAudienceMetrics(lang);
  const outlets: WritingOutlet[] = writing.outlets.map((outlet) => {
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
  if (lang === DEFAULT_LOCALE) return { ...writing, outlets };
  return { ...writingEn, outlets };
}

/** Proof points de valor, con su enlace al contexto ya localizado. */
export function getValueProps(lang: Lang): ValueProp[] {
  return valueProps.map((prop) => {
    const href = localizePath(prop.href, lang);
    if (lang === DEFAULT_LOCALE) return { ...prop, href };
    const override = valuePropsEn[prop.metric];
    return override ? { ...prop, ...override, href } : { ...prop, href };
  });
}

/** Modos de colaboración con título, descripción, CTA y enlace localizados. */
export function getCollaborationModes(lang: Lang): CollaborationMode[] {
  return collaborationModes.map((mode) => {
    const href = localizePath(mode.href, lang);
    if (lang === DEFAULT_LOCALE) return { ...mode, href };
    const override = collaborationEn[mode.icon];
    return override ? { ...mode, ...override, href } : { ...mode, href };
  });
}

/** Enlaces al CV; los documentos son los mismos, sólo cambia su etiqueta. */
export function getCvLinks(lang: Lang): CvLink[] {
  return cvLinks.map((cv) =>
    lang === DEFAULT_LOCALE ? cv : { ...cv, label: cvLabelsEn[cv.lang] ?? cv.label },
  );
}

/** Certificaciones: nombres y niveles oficiales, idénticos en los dos idiomas. */
export function getCertifications(): Certification[] {
  return certifications;
}
