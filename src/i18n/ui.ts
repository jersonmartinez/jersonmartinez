/**
 * Cadenas de INTERFAZ del sitio (cromo, encabezados de página y llamadas a la acción).
 *
 * El contenido con datos (proyectos, trayectoria, cursos…) NO vive aquí: vive en
 * `content.ts`, superpuesto sobre `src/data/portfolio.ts`. La separación es
 * deliberada: el cromo se traduce una vez, los datos se traducen por registro.
 *
 * COBERTURA GARANTIZADA EN TIEMPO DE COMPILACIÓN: el diccionario español es el
 * tipo de referencia y `UI` se declara como `Record<Lang, typeof es>`, así que a
 * `en` no le puede faltar una clave ni cambiarle el tipo sin que `astro check`
 * falle. No hace falta un gate aparte que compare claves: el compilador ya lo es.
 */

import type { Lang } from './config';

const es = {
  // --- Cromo del layout -------------------------------------------------
  htmlLang: 'es',
  skipLink: 'Saltar al contenido',
  readingProgress: 'Progreso de lectura',
  socialPreviewAlt: (title: string) => `Vista previa de ${title}`,
  newTab: '(abre en nueva pestaña)',
  newTabSuffix: ' (abre en nueva pestaña)',

  // --- Cabecera ---------------------------------------------------------
  brandAria: 'Jerson Martínez, inicio',
  mainNavAria: 'Navegación principal',
  whatsappNavAria: 'Escribir a Jerson por WhatsApp, abre en nueva pestaña',
  themeToggleAria: 'Cambiar entre tema claro y oscuro',
  themeToggleLabel: 'Tema',
  commandOpenAria: 'Abrir paleta de comandos (Ctrl o Cmd + K)',
  commandOpenLabel: 'Buscar',
  navToggleAria: 'Abrir menú',
  /**
   * Cadenas que escribe `public/scripts/site.js` en tiempo de ejecución. El
   * script es un fichero estático compartido por los dos idiomas, así que no
   * puede importar este diccionario: la cabecera las renderiza como atributos
   * `data-*` y el script las LEE del DOM. Así siguen teniendo una sola fuente
   * (este archivo) en vez de un segundo diccionario dentro del script.
   */
  navToggleAriaClose: 'Cerrar menú',
  themeActivateDark: 'Activar tema oscuro',
  themeActivateLight: 'Activar tema claro',
  themeStatusLight: 'Tema claro activado.',
  themeStatusDark: 'Tema oscuro activado.',
  langSwitchAria: 'Ver esta página en inglés',
  langSwitchLabel: 'EN',

  // --- Navegación (una etiqueta por clave de ruta) -----------------------
  nav: {
    home: 'Inicio',
    projects: 'Proyectos',
    courses: 'Cursos',
    certifications: 'Certificaciones',
    experience: 'Trayectoria',
    about: 'Sobre mí',
  },

  // --- Pie --------------------------------------------------------------
  footerNavAria: 'Secciones del sitio',
  footerSocialAria: 'Perfiles sociales',
  footerRights: 'Todos los derechos reservados.',
  footerBackToTop: 'Volver arriba',

  // --- Paleta de comandos ------------------------------------------------
  commandDialogAria: 'Paleta de comandos: ir a una sección',
  commandInputLabel: 'Buscar sección o página',
  commandPlaceholder: 'Ir a… (proyectos, cursos, certificaciones)',
  commandEmpty: 'Sin coincidencias.',
  commandContact: 'Contacto (WhatsApp)',
  /** Términos de búsqueda por clave de ruta (no visibles; alimentan el filtro). */
  commandTerms: {
    home: 'inicio home',
    projects: 'proyectos soluciones',
    courses: 'cursos formacion',
    certifications: 'certificaciones credenciales',
    experience: 'trayectoria experiencia',
    about: 'sobre mi about',
  },
  commandContactTerms: 'contacto whatsapp',

  breadcrumbAria: 'Ruta de navegación',

  // --- Componentes reutilizables ----------------------------------------
  components: {
    // ProjectCard
    projectProblem: 'Problema',
    projectContribution: 'Contribución',
    projectOutcome: 'Resultado',
    projectLicense: (license: string) => `Licencia ${license}`,
    projectUpdated: (date: string) => `Actualizado ${date}`,
    projectFactsAria: (name: string) => `Datos de ${name}`,
    projectTagsAria: (name: string) => `Tecnologías de ${name}`,
    projectDocumented: 'Proyecto documentado',
    // CourseCard
    coursePathStep: 'PASO',
    courseFree: 'Gratis',
    coursePathLabel: 'RUTA DE APRENDIZAJE',
    courseOutcomeLabel: 'Al completar esta etapa',
    courseCta: 'Ver ficha del curso',
    // CredentialCard
    credentialIssuer: 'Emisor oficial',
    credentialOne: 'credencial',
    credentialMany: 'credenciales',
    credentialsAria: (provider: string) => `Credenciales de ${provider}`,
    credentialBadgeAria: (name: string, level: string, id: string) =>
      `${name}, ${level}, ID ${id}; abrir verificación oficial en una pestaña nueva`,
    credentialVerify: 'Verificar',
    credentialMore: (total: number, provider: string) => `Ver las ${total} credenciales de ${provider}`,
    credentialMoreSr: ' en la página de certificaciones',
    // SkillsExplorer
    skillsTablistAria: 'Categorías de habilidades',
    skillApplied: 'Capacidad aplicada',
    skillEvidence: 'Evidencia',
    // CodeBlock
    codeViewSource: 'Ver fuente',
    codeCopyAria: 'Copiar bloque de código',
    codeCopy: 'Copiar',
    /** Escrita por `public/scripts/copy.js`; viaja como `data-copied-label`. */
    codeCopied: 'Copiado',
    // LogoCloud
    logoCloudAria: 'Ecosistema tecnológico',
  },

  // --- Inicio -----------------------------------------------------------
  home: {
    title: 'Jerson Martínez | DevOps, SRE y Cloud',
    railAria: 'Secciones de esta página',
    rail: {
      impact: 'Impacto',
      skills: 'Skills',
      projects: 'Proyectos',
      teaching: 'Formación',
      certifications: 'Certificaciones',
      value: 'Valor',
      contact: 'Contacto',
    },
    eyebrow: 'DEVOPS · SRE · DEVSECOPS · CLOUD',
    h1Before: 'Plataformas cloud confiables para equipos que necesitan ',
    h1Emphasis: 'avanzar.',
    currentlyPrefix: 'Actualmente',
    heroLedeTail: ' Conecto automatización, seguridad, costes y experiencia operativa para que los equipos puedan entregar con confianza.',
    ctaWhatsapp: 'Hablemos por WhatsApp',
    ctaChoosePath: 'Elegir un recorrido',
    factsAria: 'Resumen profesional',
    profilePanelAria: 'Perfil de Jerson Martínez',
    portraitAlt: 'Retrato de Jerson Martínez',
    profileRole: 'Sr. DevOps Engineer',
    profileLinksAria: 'Perfiles públicos',
    pathsKicker: 'Elige tu recorrido',
    pathsTitle: 'La evidencia adecuada para cada conversación.',
    pathsLede: 'Accede directamente a experiencia profesional, soluciones técnicas o formación.',
    impactKicker: '01 / enfoque',
    impactTitle: 'Plataformas que se pueden gobernar, medir y mejorar.',
    impactLede: 'La automatización conecta delivery, seguridad, costes y decisiones de negocio.',
    impactCards: [
      { label: 'Platform engineering', title: 'Cloud con una base operable.', body: 'Landing Zones, IaC, pipelines y estándares para que cada equipo pueda entregar sin reinventar la plataforma.', cta: 'Ver experiencia cloud' },
      { label: 'AI + DevOps', title: 'Automatización aumentada.', body: 'Asistentes GenAI, agentes y MCP conectan conocimiento, herramientas y acciones con controles claros.', cta: 'Ver sistemas de agentes' },
      { label: 'Governance', title: 'Seguridad como sistema.', body: 'GitOps, FinOps y DevSecOps integrados en el ciclo de vida, con trazabilidad y responsabilidad compartida.', cta: 'Ver experiencia de gobierno' },
    ],
    methodologyLabel: 'Metodologías y marcos',
    skillsKicker: '02 / habilidades',
    skillsTitle: 'Capacidades técnicas conectadas con evidencia.',
    skillsLede: 'Selecciona un dominio para ver tecnologías, contexto de uso y experiencias relacionadas.',
    projectsKicker: '03 / sistemas',
    projectsTitle: 'Proyectos que explican cómo trabajo.',
    projectsLede: 'Cada ficha conecta un problema, una contribución y un resultado verificable.',
    projectsCta: 'Explorar todos',
    teachingKicker: '04 / conocimiento',
    teachingTitle: 'La enseñanza también es una plataforma.',
    teachingLede: 'Cursos, artículos y canales convierten experiencia de operación en conocimiento reutilizable.',
    teachingCtaCourses: 'Ver cursos',
    teachingCtaChannels: 'Ver canales',
    writingTopicsAria: 'Temas sobre los que escribo',
    certsKicker: '05 / evidencia',
    certsTitle: 'Diez credenciales oficiales y verificables.',
    certsLede: 'AWS, Microsoft Azure y GitHub Foundations respaldan arquitectura, seguridad, delivery y operación multi-cloud.',
    certsCta: 'Ver credenciales',
    evidenceKicker: 'Evidencia técnica',
    evidenceTitle: 'Este sitio se entrega como una plataforma.',
    evidenceLede: 'El propio portfolio pasa por una cadena de build, pruebas y gates antes de publicarse.',
    pipelineLabel: 'Pipeline de validación (repo)',
    diagramTitle: 'Arquitectura de entrega del sitio',
    diagramDesc: 'El código fuente pasa por GitHub Actions, que ejecuta build y gates de calidad, y publica el sitio estático servido tras una CDN.',
    diagramNodes: { source: 'Fuente', gates: 'CI gates', build: 'Build', cdn: 'CDN' },
    diagramCaptionBefore: 'Diagrama de arquitectura (decorativo); la descripción textual está en el ',
    diagramCaptionAfter: ' y en la cadena de entrega siguiente.',
    deliveryChainSrTitle: 'Cadena de entrega, paso a paso',
    deliveryChainAria: 'Cadena de entrega del sitio basada en los workflows del repositorio',
    deliveryChain: [
      'Build Astro, tests fuente+compilados, validación de datos y enlaces internos.',
      'Lighthouse con presupuestos y pa11y-ci (WCAG2AA) sobre el dist servido.',
      'Playwright + axe-core 4.13 en las seis rutas públicas.',
      'Auditoría de enlaces externos (HEAD con reintento GET).',
      'Artefacto de vista previa por pull request.',
      'Publicación del sitio estático tras pasar los gates.',
    ],
    githubStatsAria: 'Actividad pública en GitHub (datos de build en caché)',
    githubStatsLabels: ['repositorios públicos', 'estrellas acumuladas', 'seguidores en GitHub'],
    valueKicker: 'Qué aporto a tu empresa',
    valueTitle: 'Resultados reportados, no promesas.',
    valueLede: 'Ingeniería que se traduce en coste, calidad, seguridad y conocimiento medibles. Cada cifra enlaza a su contexto.',
    contactKicker: '06 / siguiente paso',
    contactTitle: '¿Qué plataforma necesitas hacer confiable?',
    contactBody: 'Podemos conversar sobre una oportunidad profesional, consultoría o formación técnica.',
    contactCtaWhatsapp: 'Escribir por WhatsApp',
    contactCtaAbout: 'Conocer mi perfil',
  },

  // --- Proyectos --------------------------------------------------------
  projects: {
    title: 'Proyectos DevOps y Cloud | Jerson Martínez',
    description: 'Casos de producto, automatización, open source, cloud y formación desarrollados por Jerson Martínez.',
    eyebrow: 'Proyectos / casos verificables',
    h1: 'Sistemas que muestran cómo convierto problemas en operación.',
    lede: 'Productos personales, repositorios públicos, automatizaciones y contenido técnico explicados por problema, contribución y resultado.',
    metaAria: 'Resumen de proyectos',
    metaCount: (n: number) => `${n} proyectos`,
    meta: ['Producto', 'Open source', 'Automatización', 'Formación'],
    schemaName: 'Proyectos de Jerson Martínez',
    listKicker: '01 / portfolio técnico',
    listTitle: 'Filtra por el tipo de valor que buscas.',
    listLede: 'Un proyecto puede pertenecer a más de un recorrido: producto, open source o formación.',
    filterAria: 'Filtrar proyectos',
    filters: { all: 'Todos', personal: 'Personales', 'open-source': 'Open source', teaching: 'Contenido y formación' },
    /**
     * Plantilla con marcadores, no una función: el mismo texto lo escribe el
     * build (estado inicial) y `site.js` al filtrar. Una función no puede
     * viajar al navegador, así que la plantilla es lo que se comparte.
     */
    filterStatusTemplate: 'Mostrando {shown} de {total} proyectos',
    noscript: 'La lista completa permanece disponible; activa JavaScript para filtrar por categoría.',
    empty: 'No hay proyectos para este filtro.',
    nextKicker: '02 / siguiente paso',
    nextTitle: '¿Quieres profundizar en experiencia o conversar sobre una solución?',
    nextCtaExperience: 'Ver trayectoria',
    nextCtaWhatsapp: 'Contactar por WhatsApp',
  },

  // --- Cursos -----------------------------------------------------------
  courses: {
    title: 'Cursos de Go y DevOps | Jerson Martínez',
    description: 'Ruta de cursos de desarrollo web con Go y formación pública impartida por Jerson Martínez.',
    eyebrow: 'Cursos / formación pública',
    h1: 'Una ruta práctica para aprender desarrollo web con Go.',
    lede: 'Empieza por fundamentos, compara enfoques y profundiza en Gin, Echo, Fiber, Gorilla y Revel.',
    metaAria: 'Resumen de formación',
    metaUdemy: '7 cursos en Udemy',
    metaOpenWebinars: '7 cursos en OpenWebinars',
    metaStack: 'Go · Web · APIs',
    schemaName: 'Cursos de desarrollo web con Go',
    udemyKicker: '01 / ruta Udemy',
    udemyTitle: 'De fundamentos a frameworks específicos.',
    udemyLede: 'Siete etapas con un objetivo claro y enlaces directos a cada ficha pública.',
    udemyProfileCta: 'Ver perfil en Udemy',
    summarySuffix: 'en el catálogo confirmado',
    owKicker: '02 / OpenWebinars',
    owTitle: 'Siete formaciones con duración pública.',
    owLede: 'El perfil de instructor reúne cursos de desarrollo web con Go y más de 60 artículos técnicos.',
    owProfileCta: 'Ver perfil de instructor',
    owRating: (rating: string) => ` · valoración ${rating}/5`,
    owCourseCta: 'Ver formación',
    channelsKicker: '03 / canales',
    channelsTitle: 'Contenido que continúa después del curso.',
    channelsLede: 'DevOpsea y Side Master complementan la formación con sesiones prácticas.',
    /** Aviso honesto de idioma: los cursos se imparten en español. */
    languageNotice: '',
  },

  // --- Certificaciones --------------------------------------------------
  certifications: {
    title: 'Certificaciones AWS, Azure y GitHub | Jerson Martínez',
    description: 'Diez certificaciones oficiales de AWS, Microsoft Azure y GitHub Foundations con enlaces de verificación.',
    eyebrow: 'Certificaciones / evidencia oficial',
    h1: 'Diez credenciales verificables para operar mejor.',
    lede: 'AWS, Microsoft Azure y GitHub Foundations respaldan arquitectura, plataforma, seguridad y delivery multi-cloud.',
    metaAria: 'Resumen de credenciales',
    metaOfficial: (n: number) => `${n} credenciales oficiales`,
    schemaName: 'Certificaciones oficiales de Jerson Martínez',
    listKicker: '01 / certificaciones',
    listTitle: 'Cada badge abre su fuente oficial.',
    listLede: 'El nombre, nivel y credential ID permiten identificar cada certificación sin confundir competencias con credenciales.',
    learningKicker: '02 / aprendizaje continuo',
    learningTitle: 'Más de 100 certificaciones obtenidas como estudiante.',
    learningLede: 'Formación continua en tecnología y humanidades desde diciembre de 2017, además del trabajo como escritor e instructor.',
    learningCards: {
      obtainedLabel: 'Formación obtenida',
      obtainedTitle: 'Certificaciones y cursos',
      obtainedBody: 'OpenWebinars, Udemy, PluralSight, LinkedIn, Crashell y otras plataformas de aprendizaje.',
      authorLabel: 'Autor',
      authorTitle: 'Artículos publicados',
      authorBody: 'Contenido técnico sobre DevOps, cloud, observabilidad, Git y automatización.',
      instructorLabel: 'Instructor',
      instructorTitle: 'Formaciones en OpenWebinars',
      instructorBody: 'Cursos públicos de desarrollo web con Go.',
    },
    educationKicker: '03 / formación y documentos',
    educationTitle: 'Ingeniería y CV bilingüe.',
    educationLabel: 'Educación / 2013 — 2017',
    educationDegree: 'Ingeniero en Telemática.',
    educationBody: 'UNAN — León. Graduado con honores; tesis GNet con una calificación de 100 puntos.',
    educationCta: 'Ver GNet',
    cvLabel: 'CV',
    cvBody: 'Consulta la versión pública en Google Drive o descarga el PDF actualizado.',
    cvOpenDrive: 'Abrir en Google Drive',
    cvDownload: 'Descargar PDF',
    cvDownloadEs: ' en español',
    cvDownloadEn: ' en inglés',
  },

  // --- Trayectoria ------------------------------------------------------
  experience: {
    title: 'Trayectoria DevOps y Cloud | Jerson Martínez',
    description: 'Más de diez años de proyectos, formación y experiencia de Jerson Martínez en DevOps, SRE, DevSecOps y cloud.',
    eyebrow: 'Trayectoria / impacto operativo',
    h1: 'Experiencia construyendo sistemas y equipos que escalan.',
    metaAria: 'Resumen de trayectoria',
    meta: ['2016 — actualidad', 'AWS · Azure · GCP', 'GitOps · FinOps · DevSecOps', 'Liderazgo · Consultoría · Formación'],
    schemaName: 'Trayectoria profesional de Jerson Martínez',
    schemaCountry: 'Latinoamérica',
    listKicker: '01 / recorrido',
    listTitle: 'Una carrera orientada a la confiabilidad.',
    listLede: 'Se muestran experiencias seleccionadas y un periodo inicial de proyectos independientes, sin atribuir clientes o trabajos no publicados.',
    timelineAria: 'Línea de tiempo profesional, de lo más reciente a lo anterior',
    cvKicker: '02 / documentos',
    cvTitle: 'La experiencia completa está disponible en español e inglés.',
    cvCtaTalk: 'Conversar',
  },

  // --- Sobre mí ---------------------------------------------------------
  about: {
    title: 'Sobre Jerson Martínez | DevOps y Cloud',
    description: 'Perfil profesional de Jerson Martínez: DevOps, SRE, DevSecOps, cloud, automatización, liderazgo y formación.',
    eyebrow: 'Sobre mí / contexto profesional',
    h1: 'Ingeniería que conecta personas, plataformas y resultados.',
    lede: (years: number) => `Más de ${years} años combinando proyectos tecnológicos, desarrollo, operaciones e infraestructura cloud.`,
    quickLinksAria: 'Atajos del perfil',
    quickExperience: 'Ver trayectoria',
    quickProjects: 'Ver proyectos',
    quickCertifications: 'Ver certificaciones',
    schemaName: 'Sobre Jerson Martínez',
    storyKicker: '01 / historia',
    storyTitle: 'Soy Jerson 👋',
    storyP1: 'Soy Ingeniero DevOps y en Telemática. Desde 2016 he conectado desarrollo, operaciones e infraestructura cloud para construir entornos robustos, eficientes y sostenibles.',
    storyP2: 'Mi enfoque es generar impacto medible: reducir fricción operativa, automatizar delivery, fortalecer el gobierno y compartir conocimiento.',
    resultsTitle: 'Resultados que marcan la diferencia',
    results: [
      { label: 'Costes:', body: ' reducción reportada del 60% en infraestructura mediante rediseño arquitectónico y uso eficiente de recursos. ', cta: 'Ver contexto' },
      { label: 'Delivery:', body: ' pipelines CI/CD, GitHub Actions e IaC aplicados en liderazgo y consultoría. ', cta: 'Ver trayectoria' },
      { label: 'Operación:', body: ' Infralytics, desarrollado en Python, permitió ejecutar acciones sobre servidores Windows y GNU/Linux desde una aplicación web. ', cta: 'Ver experiencia' },
      { label: 'Formación:', body: ' cursos y contenido en Udemy, OpenWebinars y YouTube. ', cta: 'Ver formación' },
    ],
    storyP3: 'También trabajo con automatización e infraestructura para aplicaciones de IA, asistentes GenAI y sistemas de agentes.',
    storyP4: 'Mi objetivo es generar valor real mediante automatización, eficiencia y trabajo en equipo.',
    stackKicker: '02 / stack',
    stackTitle: 'Capacidades organizadas por dominio.',
    trustKicker: '03 / confianza',
    trustTitle: 'AWS, Azure, GitHub y formación continua.',
    trustBody: 'Diez credenciales oficiales verificables, más de 100 certificaciones obtenidas y trabajo como autor e instructor.',
    trustCta: 'Ver credenciales',
    collabKicker: '04 / colaboración',
    collabTitle: 'Tres formas de crear valor juntos.',
    talkTitle: '¿Te gustaría conversar?',
    talkBody: 'Estoy a un mensaje. Yo ya tengo el café listo, ¿y tú?',
    talkCta: 'Hablemos por WhatsApp',
    portraitAlt: 'Jerson Martínez',
  },

};

/** Forma del diccionario; el español es la referencia normativa. */
export type Dict = typeof es;

const en: Dict = {
  // --- Layout chrome ----------------------------------------------------
  htmlLang: 'en',
  skipLink: 'Skip to content',
  readingProgress: 'Reading progress',
  socialPreviewAlt: (title: string) => `Preview of ${title}`,
  newTab: '(opens in a new tab)',
  newTabSuffix: ' (opens in a new tab)',

  // --- Header -----------------------------------------------------------
  brandAria: 'Jerson Martínez, home',
  mainNavAria: 'Main navigation',
  whatsappNavAria: 'Message Jerson on WhatsApp, opens in a new tab',
  themeToggleAria: 'Switch between light and dark theme',
  themeToggleLabel: 'Theme',
  commandOpenAria: 'Open command palette (Ctrl or Cmd + K)',
  commandOpenLabel: 'Search',
  navToggleAria: 'Open menu',
  navToggleAriaClose: 'Close menu',
  themeActivateDark: 'Switch to the dark theme',
  themeActivateLight: 'Switch to the light theme',
  themeStatusLight: 'Light theme on.',
  themeStatusDark: 'Dark theme on.',
  langSwitchAria: 'Ver esta página en español',
  langSwitchLabel: 'ES',

  // --- Navigation -------------------------------------------------------
  nav: {
    home: 'Home',
    projects: 'Projects',
    courses: 'Courses',
    certifications: 'Certifications',
    experience: 'Experience',
    about: 'About',
  },

  // --- Footer -----------------------------------------------------------
  footerNavAria: 'Site sections',
  footerSocialAria: 'Social profiles',
  footerRights: 'All rights reserved.',
  footerBackToTop: 'Back to top',

  // --- Command palette --------------------------------------------------
  commandDialogAria: 'Command palette: jump to a section',
  commandInputLabel: 'Search for a section or page',
  commandPlaceholder: 'Go to… (projects, courses, certifications)',
  commandEmpty: 'No matches.',
  commandContact: 'Contact (WhatsApp)',
  commandTerms: {
    home: 'home start',
    projects: 'projects solutions work',
    courses: 'courses training',
    certifications: 'certifications credentials badges',
    experience: 'experience career timeline',
    about: 'about profile me',
  },
  commandContactTerms: 'contact whatsapp',

  breadcrumbAria: 'Breadcrumb',

  // --- Reusable components ----------------------------------------------
  components: {
    projectProblem: 'Problem',
    projectContribution: 'Contribution',
    projectOutcome: 'Outcome',
    projectLicense: (license: string) => `${license} licence`,
    projectUpdated: (date: string) => `Updated ${date}`,
    projectFactsAria: (name: string) => `${name} details`,
    projectTagsAria: (name: string) => `${name} technologies`,
    projectDocumented: 'Documented project',
    coursePathStep: 'STEP',
    courseFree: 'Free',
    coursePathLabel: 'LEARNING PATH',
    courseOutcomeLabel: 'By the end of this stage',
    courseCta: 'See course listing',
    credentialIssuer: 'Official issuer',
    credentialOne: 'credential',
    credentialMany: 'credentials',
    credentialsAria: (provider: string) => `${provider} credentials`,
    credentialBadgeAria: (name: string, level: string, id: string) =>
      `${name}, ${level}, ID ${id}; open the official verification in a new tab`,
    credentialVerify: 'Verify',
    credentialMore: (total: number, provider: string) => `See all ${total} ${provider} credentials`,
    credentialMoreSr: ' on the certifications page',
    skillsTablistAria: 'Skill categories',
    skillApplied: 'Applied capability',
    skillEvidence: 'Evidence',
    codeViewSource: 'View source',
    codeCopyAria: 'Copy code block',
    codeCopy: 'Copy',
    codeCopied: 'Copied',
    logoCloudAria: 'Technology ecosystem',
  },

  // --- Home -------------------------------------------------------------
  home: {
    title: 'Jerson Martínez | DevOps, SRE and Cloud',
    railAria: 'Sections on this page',
    rail: {
      impact: 'Impact',
      skills: 'Skills',
      projects: 'Projects',
      teaching: 'Teaching',
      certifications: 'Certifications',
      value: 'Value',
      contact: 'Contact',
    },
    eyebrow: 'DEVOPS · SRE · DEVSECOPS · CLOUD',
    h1Before: 'Reliable cloud platforms for teams that need to ',
    h1Emphasis: 'move forward.',
    currentlyPrefix: 'Currently',
    heroLedeTail: ' I connect automation, security, cost and operational experience so teams can ship with confidence.',
    ctaWhatsapp: "Let's talk on WhatsApp",
    ctaChoosePath: 'Choose a path',
    factsAria: 'Professional summary',
    profilePanelAria: 'Jerson Martínez profile',
    portraitAlt: 'Portrait of Jerson Martínez',
    profileRole: 'Sr. DevOps Engineer',
    profileLinksAria: 'Public profiles',
    pathsKicker: 'Choose your path',
    pathsTitle: 'The right evidence for every conversation.',
    pathsLede: 'Go straight to professional experience, technical solutions or training.',
    impactKicker: '01 / approach',
    impactTitle: 'Platforms you can govern, measure and improve.',
    impactLede: 'Automation connects delivery, security, cost and business decisions.',
    impactCards: [
      { label: 'Platform engineering', title: 'Cloud on an operable foundation.', body: 'Landing Zones, IaC, pipelines and standards so every team can ship without reinventing the platform.', cta: 'See cloud experience' },
      { label: 'AI + DevOps', title: 'Augmented automation.', body: 'GenAI assistants, agents and MCP connect knowledge, tools and actions under explicit controls.', cta: 'See agent systems' },
      { label: 'Governance', title: 'Security as a system.', body: 'GitOps, FinOps and DevSecOps built into the lifecycle, with traceability and shared ownership.', cta: 'See governance experience' },
    ],
    methodologyLabel: 'Methodologies and frameworks',
    skillsKicker: '02 / skills',
    skillsTitle: 'Technical capabilities tied to evidence.',
    skillsLede: 'Pick a domain to see technologies, where they were used and the related experience.',
    projectsKicker: '03 / systems',
    projectsTitle: 'Projects that explain how I work.',
    projectsLede: 'Each card connects a problem, a contribution and a verifiable outcome.',
    projectsCta: 'Explore all',
    teachingKicker: '04 / knowledge',
    teachingTitle: 'Teaching is a platform too.',
    teachingLede: 'Courses, articles and channels turn operational experience into reusable knowledge.',
    teachingCtaCourses: 'See courses',
    teachingCtaChannels: 'See channels',
    writingTopicsAria: 'Topics I write about',
    certsKicker: '05 / evidence',
    certsTitle: 'Ten official, verifiable credentials.',
    certsLede: 'AWS, Microsoft Azure and GitHub Foundations back architecture, security, delivery and multi-cloud operations.',
    certsCta: 'See credentials',
    evidenceKicker: 'Technical evidence',
    evidenceTitle: 'This site ships like a platform.',
    evidenceLede: 'The portfolio itself goes through a build, test and gate chain before it is published.',
    pipelineLabel: 'Validation pipeline (repo)',
    diagramTitle: 'Site delivery architecture',
    diagramDesc: 'Source code goes through GitHub Actions, which runs the build and quality gates, and publishes the static site served behind a CDN.',
    diagramNodes: { source: 'Source', gates: 'CI gates', build: 'Build', cdn: 'CDN' },
    diagramCaptionBefore: 'Architecture diagram (decorative); the text description lives in the ',
    diagramCaptionAfter: ' element and in the delivery chain below.',
    deliveryChainSrTitle: 'Delivery chain, step by step',
    deliveryChainAria: 'Site delivery chain based on the repository workflows',
    deliveryChain: [
      'Astro build, source and compiled-output tests, data validation and internal links.',
      'Lighthouse with budgets and pa11y-ci (WCAG2AA) against the served dist.',
      'Playwright + axe-core 4.13 across the six public routes.',
      'External link audit (HEAD with GET retry).',
      'Per-pull-request preview artifact.',
      'Static site publication once the gates pass.',
    ],
    githubStatsAria: 'Public GitHub activity (cached build data)',
    githubStatsLabels: ['public repositories', 'total stars', 'GitHub followers'],
    valueKicker: 'What I bring to your company',
    valueTitle: 'Reported results, not promises.',
    valueLede: 'Engineering that translates into measurable cost, quality, security and knowledge. Every figure links to its context.',
    contactKicker: '06 / next step',
    contactTitle: 'Which platform do you need to make reliable?',
    contactBody: 'We can talk about a role, consulting work or technical training.',
    contactCtaWhatsapp: 'Message on WhatsApp',
    contactCtaAbout: 'See my profile',
  },

  // --- Projects ---------------------------------------------------------
  projects: {
    title: 'DevOps and Cloud projects | Jerson Martínez',
    description: 'Product, automation, open source, cloud and training work built by Jerson Martínez.',
    eyebrow: 'Projects / verifiable cases',
    h1: 'Systems that show how I turn problems into operations.',
    lede: 'Personal products, public repositories, automation and technical content, each explained by problem, contribution and outcome.',
    metaAria: 'Projects summary',
    metaCount: (n: number) => `${n} projects`,
    meta: ['Product', 'Open source', 'Automation', 'Teaching'],
    schemaName: 'Projects by Jerson Martínez',
    listKicker: '01 / technical portfolio',
    listTitle: 'Filter by the kind of value you are looking for.',
    listLede: 'A project can belong to more than one path: product, open source or teaching.',
    filterAria: 'Filter projects',
    filters: { all: 'All', personal: 'Personal', 'open-source': 'Open source', teaching: 'Content and teaching' },
    filterStatusTemplate: 'Showing {shown} of {total} projects',
    noscript: 'The full list stays available; enable JavaScript to filter by category.',
    empty: 'No projects match this filter.',
    nextKicker: '02 / next step',
    nextTitle: 'Want to dig into the experience or talk through a solution?',
    nextCtaExperience: 'See experience',
    nextCtaWhatsapp: 'Get in touch on WhatsApp',
  },

  // --- Courses ----------------------------------------------------------
  courses: {
    title: 'Go and DevOps courses | Jerson Martínez',
    description: 'A learning path of Go web development courses and public training delivered by Jerson Martínez.',
    eyebrow: 'Courses / public training',
    h1: 'A practical path to learn web development with Go.',
    lede: 'Start with the fundamentals, compare approaches and go deeper into Gin, Echo, Fiber, Gorilla and Revel.',
    metaAria: 'Training summary',
    metaUdemy: '7 courses on Udemy',
    metaOpenWebinars: '7 courses on OpenWebinars',
    metaStack: 'Go · Web · APIs',
    schemaName: 'Go web development courses',
    udemyKicker: '01 / Udemy path',
    udemyTitle: 'From fundamentals to specific frameworks.',
    udemyLede: 'Seven stages with a clear goal and direct links to each public listing.',
    udemyProfileCta: 'See Udemy profile',
    summarySuffix: 'in the confirmed catalogue',
    owKicker: '02 / OpenWebinars',
    owTitle: 'Seven courses with published runtimes.',
    owLede: 'The instructor profile gathers Go web development courses and more than 60 technical articles.',
    owProfileCta: 'See instructor profile',
    owRating: (rating: string) => ` · rated ${rating}/5`,
    owCourseCta: 'See course',
    channelsKicker: '03 / channels',
    channelsTitle: 'Content that continues after the course.',
    channelsLede: 'DevOpsea and Side Master complement the courses with hands-on sessions.',
    /**
     * Aviso de idioma. Los cursos se imparten EN ESPAÑOL: omitirlo en la versión
     * inglesa llevaría a un lector anglófono a comprar un curso que no entiende.
     * Es información real del producto, no relleno.
     */
    languageNotice: 'These courses are taught in Spanish.',
  },

  // --- Certifications ---------------------------------------------------
  certifications: {
    title: 'AWS, Azure and GitHub certifications | Jerson Martínez',
    description: 'Ten official AWS, Microsoft Azure and GitHub Foundations certifications with verification links.',
    eyebrow: 'Certifications / official evidence',
    h1: 'Ten verifiable credentials for better operations.',
    lede: 'AWS, Microsoft Azure and GitHub Foundations back architecture, platform, security and multi-cloud delivery.',
    metaAria: 'Credentials summary',
    metaOfficial: (n: number) => `${n} official credentials`,
    schemaName: 'Official certifications of Jerson Martínez',
    listKicker: '01 / certifications',
    listTitle: 'Every badge opens its official source.',
    listLede: 'Name, level and credential ID identify each certification without confusing skills with credentials.',
    learningKicker: '02 / continuous learning',
    learningTitle: 'More than 100 certifications earned as a student.',
    learningLede: 'Continuous training in technology and the humanities since December 2017, alongside the work as writer and instructor.',
    learningCards: {
      obtainedLabel: 'Training earned',
      obtainedTitle: 'Certifications and courses',
      obtainedBody: 'OpenWebinars, Udemy, PluralSight, LinkedIn, Crashell and other learning platforms.',
      authorLabel: 'Author',
      authorTitle: 'Published articles',
      authorBody: 'Technical content on DevOps, cloud, observability, Git and automation.',
      instructorLabel: 'Instructor',
      instructorTitle: 'Courses on OpenWebinars',
      instructorBody: 'Public Go web development courses.',
    },
    educationKicker: '03 / education and documents',
    educationTitle: 'Engineering degree and a bilingual CV.',
    educationLabel: 'Education / 2013 — 2017',
    educationDegree: 'Telematics Engineer.',
    educationBody: 'UNAN — León. Graduated with honours; GNet thesis scored 100 out of 100.',
    educationCta: 'See GNet',
    cvLabel: 'CV',
    cvBody: 'Read the public version on Google Drive or download the updated PDF.',
    cvOpenDrive: 'Open in Google Drive',
    cvDownload: 'Download PDF',
    cvDownloadEs: ' in Spanish',
    cvDownloadEn: ' in English',
  },

  // --- Experience -------------------------------------------------------
  experience: {
    title: 'DevOps and Cloud experience | Jerson Martínez',
    description: 'More than ten years of projects, training and experience by Jerson Martínez in DevOps, SRE, DevSecOps and cloud.',
    eyebrow: 'Experience / operational impact',
    h1: 'Experience building systems and teams that scale.',
    metaAria: 'Experience summary',
    meta: ['2016 — present', 'AWS · Azure · GCP', 'GitOps · FinOps · DevSecOps', 'Leadership · Consulting · Teaching'],
    schemaName: 'Professional experience of Jerson Martínez',
    schemaCountry: 'Latin America',
    listKicker: '01 / timeline',
    listTitle: 'A career built around reliability.',
    listLede: 'Selected roles plus an early period of independent projects, with no clients or unpublished work attributed.',
    timelineAria: 'Professional timeline, most recent first',
    cvKicker: '02 / documents',
    cvTitle: 'The full experience is available in Spanish and English.',
    cvCtaTalk: 'Start a conversation',
  },

  // --- About ------------------------------------------------------------
  about: {
    title: 'About Jerson Martínez | DevOps and Cloud',
    description: 'Professional profile of Jerson Martínez: DevOps, SRE, DevSecOps, cloud, automation, leadership and teaching.',
    eyebrow: 'About / professional context',
    h1: 'Engineering that connects people, platforms and results.',
    lede: (years: number) => `More than ${years} years combining technology projects, development, operations and cloud infrastructure.`,
    quickLinksAria: 'Profile shortcuts',
    quickExperience: 'See experience',
    quickProjects: 'See projects',
    quickCertifications: 'See certifications',
    schemaName: 'About Jerson Martínez',
    storyKicker: '01 / story',
    storyTitle: "I'm Jerson 👋",
    storyP1: 'I am a DevOps and Telematics engineer. Since 2016 I have connected development, operations and cloud infrastructure to build robust, efficient and sustainable environments.',
    storyP2: 'My focus is measurable impact: reduce operational friction, automate delivery, strengthen governance and share knowledge.',
    resultsTitle: 'Results that make the difference',
    results: [
      { label: 'Cost:', body: ' a reported 60% reduction in infrastructure through architectural redesign and efficient resource use. ', cta: 'See context' },
      { label: 'Delivery:', body: ' CI/CD pipelines, GitHub Actions and IaC applied in leadership and consulting roles. ', cta: 'See experience' },
      { label: 'Operations:', body: ' Infralytics, built in Python, made it possible to run actions on Windows and GNU/Linux servers from a web application. ', cta: 'See the role' },
      { label: 'Teaching:', body: ' courses and content on Udemy, OpenWebinars and YouTube. ', cta: 'See training' },
    ],
    storyP3: 'I also work on automation and infrastructure for AI applications, GenAI assistants and agent systems.',
    storyP4: 'My goal is to create real value through automation, efficiency and teamwork.',
    stackKicker: '02 / stack',
    stackTitle: 'Capabilities organised by domain.',
    trustKicker: '03 / trust',
    trustTitle: 'AWS, Azure, GitHub and continuous learning.',
    trustBody: 'Ten verifiable official credentials, more than 100 certifications earned, and work as an author and instructor.',
    trustCta: 'See credentials',
    collabKicker: '04 / collaboration',
    collabTitle: 'Three ways to create value together.',
    talkTitle: 'Shall we talk?',
    talkBody: "I'm one message away. My coffee is ready — is yours?",
    talkCta: "Let's talk on WhatsApp",
    portraitAlt: 'Jerson Martínez',
  },

};

export const UI: Record<Lang, Dict> = { es, en };

/** Diccionario de interfaz del idioma dado. */
export function t(lang: Lang): Dict {
  return UI[lang];
}

/**
 * Rellena `{shown}` y `{total}` de una plantilla de estado de filtro.
 * `site.js` hace exactamente la misma sustitución sobre la plantilla que recibe
 * por `data-template`, de modo que el texto inicial y el filtrado coinciden.
 */
export function formatFilterStatus(template: string, shown: number, total: number): string {
  return template.replace('{shown}', String(shown)).replace('{total}', String(total));
}
