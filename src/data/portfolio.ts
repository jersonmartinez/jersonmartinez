// Fuente única de verdad del portfolio.
// Los datos públicos proceden del CV ES/EN actualizado, del perfil de GitHub,
// de OpenWebinars y de cifras confirmadas directamente por Jerson.
//
// Cada export lleva su tipo de `src/types/content.ts`, así que el COMPILADOR
// verifica el dato contra su contrato: un campo que falte, sobre o cambie de
// tipo rompe `astro check`. Se sigue editando igual (objetos literales); lo que
// antes no existía era la comprobación.

import type {
  AudienceMetrics, Certification, CollaborationMode, ContentMeta, Course, CvLink,
  ExperienceRecord, OpenWebinarsCourse, Profile, Project, Skill, TeachingEntry,
  ValueProp, ChannelEntry, Writing,
} from '../types/content';

export const contentMeta: ContentMeta = {
  lastReviewed: '2026-10-06',
  careerStartYear: 2016,
  continuousLearningSince: '2017-12',
};

export const profile: Profile = {
  name: 'Jerson Martínez',
  location: 'Latinoamérica · GMT-6',
  email: 'jersonmartinezsm@gmail.com',
  website: 'https://www.jersonmartinez.com',
  github: 'https://github.com/jersonmartinez',
  linkedin: 'https://www.linkedin.com/in/jersonmartinezsm/',
  whatsapp: 'https://api.whatsapp.com/send?phone=50589630866&text=Hola%2C%20un%20gusto%20saludarte.%20Te%20escribimos%20porque%20nos%20gustar%C3%ADa%20conocerte%20mejor%20y%20explorar%20una%20posible%20colaboraci%C3%B3n.%20%C2%BFEst%C3%A1s%20disponible%20para%20conversar%3F',
  headline: 'Ingeniero DevOps, SRE y DevSecOps especializado en plataformas cloud',
  intro: 'Diseño plataformas cloud confiables, automatizo operaciones y convierto la gobernanza en una ventaja para los equipos.',
  yearsExperience: 10,
  facts: [
    ['+10', 'años de experiencia', { source: 'careerStartYear' }],
    ['3', 'Cloud Providers'],
    ['100+', 'certificaciones obtenidas', { href: '/certifications.html', label: 'Ver certificaciones y aprendizaje' }],
    ['60+', 'artículos publicados', { href: 'https://openwebinars.net/profesores/antoniomorenosm/', label: 'Ver perfil de autor en OpenWebinars', external: true }],
  ],
};

profile.facts[0][0] = `+${profile.yearsExperience}`;

export const audienceMetrics: AudienceMetrics = {
  udemy: { label: '+77K estudiantes', longLabel: 'Más de 77 mil estudiantes', lastVerifiedAt: '2026-09-30', source: 'Confirmado por Jerson' },
  devopsea: { label: '+14K suscriptores', lastVerifiedAt: '2026-09-30', source: 'Confirmado por Jerson' },
  sideMaster: { label: '+5K suscriptores', lastVerifiedAt: '2026-09-30', source: 'Confirmado por Jerson' },
  openWebinarsArticles: { label: '+60 artículos', lastVerifiedAt: '2026-09-30', source: 'Confirmado por Jerson' },
  openWebinarsCourses: { label: '7 cursos impartidos', lastVerifiedAt: '2026-09-30', source: 'Perfil público de OpenWebinars' },
};

export const skills: Skill[] = [
  {
    name: 'Infraestructura', icon: 'fa-server',
    summary: 'Operación híbrida con foco en continuidad, capacidad y administración de sistemas.',
    evidence: 'Infralytics permitió ejecutar desde una interfaz web acciones operativas sobre servidores Windows y GNU/Linux.',
    items: ['Infraestructura híbrida (on-premises + cloud)', 'Windows Server', 'GNU/Linux', 'Microsoft Entra ID', 'Active Directory', 'IIS', 'DNS', 'DHCP', 'LDAP', 'NTP', 'Capacity planning', 'Right-sizing', 'BCP / DRP', 'High availability', 'Failover', 'Multi-AZ / Multi-region'],
    relatedHref: '/experience.html#hotaka-ikhodi', relatedLabel: 'Ver experiencia en Hotaka iKhodi',
  },
  {
    name: 'Cloud', icon: 'fa-cloud',
    summary: 'Arquitectura y gobierno multi-cloud para convertir la nube en una plataforma operable.',
    evidence: 'Experiencia con AWS, Azure y GCP en Landing Zones, AWS MAP, migraciones, automatización y gobierno cloud.',
    items: ['AWS', 'Microsoft Azure', 'Google Cloud Platform (GCP)', 'AWS MAP', 'Landing Zones', 'Cloud Governance', 'Infrastructure Modernization'],
    relatedHref: '/experience.html', relatedLabel: 'Recorrer la trayectoria cloud',
  },
  {
    name: 'Virtualización', icon: 'fa-layer-group',
    summary: 'Entornos virtualizados para laboratorios, cargas híbridas y plataformas reproducibles.',
    evidence: 'El dominio se integra como base de la operación híbrida y la automatización de infraestructura.',
    items: ['VMware vSphere', 'Hyper-V', 'KVM', 'VirtualBox', 'Vagrant'],
    relatedHref: '/projects.html', relatedLabel: 'Ver proyectos de infraestructura',
  },
  {
    name: 'Contenedores', icon: 'fa-cubes',
    summary: 'Empaquetado y orquestación para entornos consistentes desde desarrollo hasta producción.',
    evidence: 'Docker y Kubernetes forman parte del stack aplicado a automatización, delivery y modernización de plataformas.',
    items: ['Docker', 'Podman', 'WSL Container', 'Kubernetes'],
    relatedHref: '/projects.html#proyecto-docker-lamp', relatedLabel: 'Ver docker-lamp',
  },
  {
    name: 'IaC', icon: 'fa-code-branch',
    summary: 'Infraestructura declarativa, repetible y trazable como parte del ciclo de delivery.',
    evidence: 'Terraform, Ansible y Pulumi se aplican en gobierno, automatización y despliegues sobre AWS, Azure y GCP.',
    items: ['Terraform', 'Ansible', 'Pulumi', 'CloudFormation', 'AWS SAM'],
    relatedHref: '/experience.html', relatedLabel: 'Ver IaC en la trayectoria',
  },
  {
    name: 'DevOps & CI/CD', icon: 'fa-code-branch',
    summary: 'Pipelines y estándares que reducen trabajo manual y hacen visible el estado del delivery.',
    evidence: 'GitHub Actions, GitOps y automatización CI/CD aparecen de forma transversal en consultoría, liderazgo y open source.',
    items: ['Git', 'GitHub Actions', 'Azure DevOps: Repos, Pipelines, Boards, Artifacts y Environments', 'Rundeck'],
    relatedHref: '/projects.html#proyecto-reusable-workflows', relatedLabel: 'Ver Reusable Workflows',
  },
  {
    name: 'Observabilidad', icon: 'fa-chart-line',
    summary: 'Telemetría para entender salud, capacidad y comportamiento antes de que una alerta se convierta en incidente.',
    evidence: 'El stack combina Grafana, Prometheus, ELK, Datadog y herramientas de monitoreo de infraestructura.',
    items: ['Grafana', 'Prometheus', 'ELK Stack', 'Filebeat', 'Telegraf', 'Datadog', 'Zabbix', 'SolarWinds', 'Nagios'],
    relatedHref: '/projects.html#proyecto-gnet', relatedLabel: 'Ver GNet',
  },
  {
    name: 'Storage & Backup', icon: 'fa-database',
    summary: 'Persistencia, protección y recuperación como parte del diseño de continuidad.',
    evidence: 'Servicios administrados, snapshots e imágenes forman parte del mapa técnico de operación cloud.',
    items: ['AWS EBS', 'AWS FSx', 'Azure Files', 'AWS Backup', 'Azure Backup', 'Snapshots', 'Amazon Machine Images (AMI)'],
    relatedHref: '/certifications.html', relatedLabel: 'Ver certificaciones cloud',
  },
  {
    name: 'Seguridad y gobierno', icon: 'fa-shield-alt',
    summary: 'Controles incorporados al ciclo de vida, no añadidos al final del proceso.',
    evidence: 'GitOps, FinOps y DevSecOps se aplican junto con IAM, trazabilidad, seguridad continua y gobierno multi-cloud.',
    items: ['ITIL', 'ISO 27001', 'DevSecOps', 'FinOps', 'IAM', 'AWS Security Hub', 'GuardDuty', 'Inspector', 'Secrets Manager'],
    relatedHref: '/experience.html', relatedLabel: 'Ver experiencia en gobierno',
  },
  {
    name: 'IA generativa', icon: 'fa-robot',
    summary: 'IA aplicada a conocimiento, automatización y operación con controles explícitos.',
    evidence: 'La experiencia reciente incluye asistentes GenAI, RAG, evaluación de modelos y herramientas de ingeniería asistida.',
    items: ['RAG', 'LLM orchestration', 'Model evaluation', 'AWS Bedrock', 'Gemini', 'LibreChat', 'AI-assisted software engineering', 'Prompt and context management', 'Kiro', 'Devin', 'Claude Code', 'Cursor'],
    relatedHref: '/projects.html#proyecto-kiro-crew', relatedLabel: 'Ver Kiro Crew',
  },
  {
    name: 'Desarrollo', icon: 'fa-terminal',
    summary: 'Código y scripting para conectar APIs, plataformas, automatizaciones y producto.',
    evidence: 'Python, Go, Bash y PowerShell son herramientas recurrentes; los MCP públicos muestran implementaciones en Python y Go.',
    items: ['Python', 'PowerShell', 'Bash', 'Batch', 'Go', 'JavaScript', 'PHP', 'HTML', 'CSS', 'SQL'],
    relatedHref: '/projects.html', relatedLabel: 'Ver proyectos de software',
  },
  {
    name: 'Bases de datos', icon: 'fa-database',
    summary: 'Persistencia relacional, documental y en memoria dentro de aplicaciones y plataformas.',
    evidence: 'El stack profesional incluye MySQL, PostgreSQL, SQL Server, MongoDB, Redis y DynamoDB.',
    items: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Redis', 'DynamoDB'],
    relatedHref: '/projects.html', relatedLabel: 'Ver proyectos relacionados',
  },
  {
    name: 'Idiomas', icon: 'fa-language',
    summary: 'Colaboración técnica en español e inglés en equipos y clientes internacionales.',
    evidence: 'Español nativo e inglés B1 de trabajo profesional, según el CV actualizado.',
    items: ['Español (nativo)', 'English (B1 · Professional Working Proficiency)'],
    relatedHref: '/about.html', relatedLabel: 'Conocer el perfil',
  },
];

// El agrupado del stack vive en `getStackGroups` (src/i18n/content.ts), que
// selecciona por clave neutra y muestra el nombre traducido. Un `stackGroups`
// aquí quedaría fijado al español y, desde la i18n, sin un solo consumidor.

export const projectSlug = (name: string): string => `proyecto-${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;

export const projects: Project[] = [
  {
    name: 'Factib', kind: 'Producto personal', categories: ['personal'], theme: 'Producto · IA aplicada · Plataforma',
    description: 'Producto personal orientado a convertir decisiones financieras en una experiencia operable y clara.',
    role: 'Diseño y desarrollo de producto', problem: 'Transformar información financiera en decisiones comprensibles.',
    contribution: 'Producto, automatización y experiencia operativa.', outcome: 'Un proyecto propio que conecta ingeniería de producto y claridad financiera.',
    tags: ['Product engineering', 'AI-ready', 'Automation'], href: 'https://factib.com', cta: 'Visitar Factib', featured: true,
  },
  {
    name: 'Crashell', kind: 'Producto y publicaciones', categories: ['personal', 'teaching'], theme: 'Educación técnica · DevOps',
    description: 'Espacio propio para publicar conocimiento práctico sobre cloud, sistemas, Docker, Git y automatización.',
    role: 'Cofundador y CEO', problem: 'Convertir experiencia técnica en servicios y conocimiento reutilizable.',
    contribution: 'Dirección, contenido técnico y servicios DevOps.', outcome: 'Una plataforma que conecta práctica profesional, formación y comunidad.',
    tags: ['Technical content', 'Docker', 'Git'], href: 'https://www.crashell.com/estudio', cta: 'Visitar Crashell', featured: true,
  },
  {
    name: 'MCP GitHub Projects', kind: 'Open source · creador', categories: ['open-source'], theme: 'IA + DevOps · Gobernanza',
    description: 'Servidor MCP para administrar GitHub Projects V2: issues, campos, workflows y automatización desde clientes MCP.',
    role: 'Creador y mantenedor', problem: 'Operar proyectos complejos sin repetir tareas manuales sobre la interfaz.',
    contribution: 'Arquitectura, herramientas MCP, automatización y documentación.', outcome: 'Más de 100 herramientas públicas para gestión de proyectos y workflows.',
    tags: ['Python', 'MCP', 'GitHub API', 'Governance'], language: 'Python', license: 'MIT', updatedAt: '2026-09-29',
    href: 'https://github.com/jersonmartinez/mcp-github-projects', cta: 'Ver repositorio', featured: true,
  },
  {
    name: 'MCP Monday Projects', kind: 'Open source · creador', categories: ['open-source'], theme: 'IA + DevOps · Operaciones',
    description: 'Servidor MCP de alto rendimiento para workspaces, boards, items y colaboración en monday.com.',
    role: 'Creador y mantenedor', problem: 'Integrar agentes y automatización con operaciones reales de monday.com.',
    contribution: 'Servidor en Go, diseño de herramientas, seguridad y documentación.', outcome: 'Automatización pública de workspaces y flujos de colaboración.',
    tags: ['Go', 'MCP', 'Monday.com', 'Automation'], language: 'Go', license: 'MIT', updatedAt: '2026-09-29',
    href: 'https://github.com/jersonmartinez/mcp-monday-projects', cta: 'Ver repositorio', featured: true,
  },
  {
    name: 'Kiro Crew', kind: 'Open source · plataforma', categories: ['open-source'], theme: 'Agentes · automatización · orquestación',
    description: 'Capa de gestión de agentes y automatizaciones con memoria persistente, jobs programados y flujos multi-sesión.',
    role: 'Creador y mantenedor', problem: 'Coordinar trabajo autónomo sin perder contexto, control ni trazabilidad.',
    contribution: 'Orquestación, memoria, automatización y experiencia de operación.', outcome: 'Una plataforma pública para trabajo multi-agente y multi-sesión.',
    tags: ['Agent systems', 'Automation', 'Orchestration'], language: 'Shell', license: 'MIT', updatedAt: '2026-09-27',
    href: 'https://github.com/jersonmartinez/kiro-crew', cta: 'Ver repositorio', featured: true,
  },
  {
    name: 'GNet', kind: 'Proyecto académico · 100 puntos', categories: ['open-source'], theme: 'Network management · GNU/Linux',
    description: 'Sistema web de gestión de red y dispositivos informáticos GNU/Linux, desarrollado como tesis de Ingeniería en Telemática.',
    role: 'Autor de la tesis y desarrollador', problem: 'Centralizar la gestión y visibilidad de dispositivos de red GNU/Linux.',
    contribution: 'Diseño y desarrollo del sistema web.', outcome: 'Tesis graduada con honores y calificación de 100 puntos.',
    tags: ['JavaScript', 'GNU/Linux', 'Monitoring'], language: 'JavaScript', license: 'Apache-2.0', updatedAt: '2025-04-10',
    href: 'https://github.com/jersonmartinez/GNet', cta: 'Ver repositorio',
  },
  {
    name: 'InfraQuiz', kind: 'Open source · aprendizaje', categories: ['open-source', 'teaching'], theme: 'DevOps · práctica técnica',
    description: 'Cuestionarios interactivos sobre herramientas y metodologías DevOps para reforzar conocimientos y preparar entrevistas o certificaciones.',
    role: 'Creador y mantenedor', problem: 'Practicar conocimientos DevOps de forma estructurada e interactiva.',
    contribution: 'Contenido, interfaz y mantenimiento del repositorio.', outcome: 'Un recurso público de práctica técnica.',
    tags: ['JavaScript', 'DevOps', 'Kubernetes', 'Ansible'], language: 'JavaScript', updatedAt: '2026-02-14',
    href: 'https://github.com/jersonmartinez/InfraQuiz', cta: 'Ver repositorio',
  },
  {
    name: 'Reusable Workflows', kind: 'Open source · GitHub Actions', categories: ['open-source'], theme: 'CI/CD · estandarización',
    description: 'Workflows reutilizables para crear pipelines consistentes y reducir duplicación entre repositorios.',
    role: 'Creador y mantenedor', problem: 'Evitar que cada repositorio implemente desde cero los mismos controles CI/CD.',
    contribution: 'Diseño de workflows y automatización reutilizable.', outcome: 'Pipelines compartidos bajo licencia Apache 2.0.',
    tags: ['GitHub Actions', 'CI/CD', 'Automation'], language: 'Python', license: 'Apache-2.0', updatedAt: '2025-12-09',
    href: 'https://github.com/jersonmartinez/reusable-workflows', cta: 'Ver repositorio',
  },
  {
    name: 'DevOps YouTube Channels', kind: 'Contenido técnico · automatización', categories: ['open-source', 'teaching'], theme: 'Formación · Go · Python · DevOps',
    description: 'Automatización y presentación de contenido para DevOpsea y Side Master.',
    role: 'Creador de contenido y desarrollador', problem: 'Mantener materiales técnicos y canales conectados con fuentes reproducibles.',
    contribution: 'Automatización, contenido y mantenimiento.', outcome: 'Un repositorio público que respalda los canales formativos.',
    tags: ['JavaScript', 'YouTube', 'Go', 'Teaching'], language: 'JavaScript', license: 'MIT', updatedAt: '2026-09-06',
    href: 'https://github.com/jersonmartinez/DevOps-YouTube-Channels', cta: 'Ver repositorio',
  },
  {
    name: 'docker-lamp', kind: 'Open source · Docker Compose', categories: ['open-source'], theme: 'Docker · PHP · Apache · MySQL',
    description: 'Stack LAMP moderno con Docker Compose para desarrollo web reproducible.',
    role: 'Creador y mantenedor', problem: 'Reducir fricción al levantar un entorno LAMP de desarrollo.',
    contribution: 'Composición de servicios, interfaz y documentación.', outcome: 'Entorno público con PHP 8.2, MySQL, phpMyAdmin y Apache.',
    tags: ['Docker Compose', 'PHP', 'MySQL'], language: 'CSS', license: 'Unlicense', updatedAt: '2026-09-29',
    href: 'https://github.com/jersonmartinez/docker-lamp', cta: 'Ver repositorio',
  },
];

export const experience: ExperienceRecord[] = [
  { id: 'mindtech-nubity', start: '2025-10', end: null, period: 'Octubre 2025 — actualidad', role: 'DevOps Tech Lead', company: 'MindTech — Nubity', description: 'Liderazgo de proyectos DevOps para clientes de Latinoamérica con GitOps, FinOps, DevSecOps, gobierno AWS/Azure, migraciones ETL, asistentes GenAI, AWS MAP y Landing Zones.', context: 'Rol actual de liderazgo técnico.', related: [{ label: 'Ver proyectos de automatización', href: '/projects.html' }] },
  { id: 'pliret-prb', start: '2025-08', end: null, period: 'Agosto 2025 — actualidad', role: 'Sr. DevOps Engineer · Consultor', company: 'Pliret — PRB', description: 'Gobierno interno, GitHub Actions, Terraform y Ansible sobre GCP; mejora reportada del 60% en trazabilidad, seguridad y eficiencia operativa.', context: 'Consultoría concurrente con el rol principal.', related: [{ label: 'Ver habilidades de gobierno', href: '/#skills' }] },
  { id: 'coderslab', start: '2025-02', end: '2025-07', period: 'Febrero — julio 2025', role: 'DevOps Specialist', company: 'CodersLab · Coca-Cola Andina', description: 'GitOps y CI/CD con AWS Lambda, API Gateway, Step Functions, DynamoDB, Terraform, GitHub Actions, Python y Node.js.', related: [{ label: 'Ver experiencia cloud', href: '/#skills' }] },
  { id: 'hotaka-tech-lead', start: '2023-02', end: '2025-02', period: 'Febrero 2023 — febrero 2025', role: 'Tech Lead DevOps', company: 'Hotaka iKhodi', description: 'Liderazgo de cultura DevOps y automatización cloud para equipos de alto rendimiento y clientes internacionales.', related: [{ label: 'Ver proyectos', href: '/projects.html' }] },
  { id: 'hotaka-ikhodi', start: '2020-09', end: '2023-02', period: 'Septiembre 2020 — febrero 2023', role: 'DevOps Engineer', company: 'Hotaka iKhodi', description: 'Optimización de infraestructura con una reducción de costes reportada del 60%. Desarrollo de Infralytics en Python: una aplicación web para ejecutar acciones operativas sobre servidores Windows y GNU/Linux.', related: [{ label: 'Ver habilidades de infraestructura', href: '/#skills' }] },
  { id: 'instructor', start: '2022-02', end: null, period: 'Febrero 2022 — actualidad', role: 'Instructor DevOps y DevSecOps', company: 'OpenWebinars · Udemy · YouTube', description: 'Formación para miles de estudiantes sobre GitHub Actions, Python, Flask y frameworks web de Go.', related: [{ label: 'Ver cursos', href: '/courses.html' }] },
  { id: 'elite-online-media', start: '2019-01', end: '2020-09', period: 'Enero 2019 — septiembre 2020', role: 'Full-Stack Developer', company: 'Elite Online Media', description: 'Automatización, trabajo remoto y seguridad avanzada; mejora reportada superior al 80% en calidad backend.', related: [{ label: 'Ver proyectos de desarrollo', href: '/projects.html' }] },
  { id: 'independent-projects', start: '2016', end: '2018', period: '2016 — 2018', role: 'Proyectos tecnológicos independientes', company: 'Desarrollo y formación continua', description: 'Desarrollo de proyectos tecnológicos no detallados públicamente y aprendizaje continuo; desde diciembre de 2017, formación en plataformas como Udemy y OpenWebinars, además de contenido técnico en YouTube.', context: 'Este periodo sustenta el inicio de una trayectoria de más de 10 años sin atribuir proyectos o clientes no publicados.', related: [{ label: 'Ver aprendizaje y certificaciones', href: '/certifications.html' }] },
];

export const certifications: Certification[] = [
  {
    provider: 'AWS', logo: '/brands/aws.svg', issuerUrl: 'https://aws.amazon.com/certification/',
    items: [
      { name: 'AWS Certified Cloud Practitioner', code: 'CCP', level: 'Foundational', credentialId: '2HHK4HSBFFF118SH', href: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/2HHK4HSBFFF118SH' },
      { name: 'AWS Certified Solutions Architect — Associate', code: 'SAA', level: 'Associate', credentialId: '9d4c32d819004186b71dd30d50cf81f8', href: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/9d4c32d819004186b71dd30d50cf81f8' },
      { name: 'AWS Certified DevOps Engineer — Professional', code: 'DOP-C02', level: 'Professional', credentialId: 'bad6589844784db59d2b7da6385549ee', href: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/bad6589844784db59d2b7da6385549ee' },
    ],
  },
  {
    provider: 'Microsoft Azure', logo: '/brands/azure.svg', issuerUrl: 'https://learn.microsoft.com/credentials/',
    items: [
      { name: 'Microsoft Azure Fundamentals', code: 'AZ-900', level: 'Fundamentals', credentialId: '44AAF997D4FC41F1', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/44AAF997D4FC41F1?sharingId=DD110D69941D2F8B' },
      { name: 'Microsoft Azure Data Fundamentals', code: 'DP-900', level: 'Fundamentals', credentialId: '8093C64EDF8D16D1', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/8093C64EDF8D16D1?sharingId=DD110D69941D2F8B' },
      { name: 'Microsoft Azure Administrator Associate', code: 'AZ-104', level: 'Associate', credentialId: '19489B0720DDF744', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/19489B0720DDF744?sharingId=DD110D69941D2F8B' },
      { name: 'Microsoft DevOps Engineer Expert', code: 'AZ-400', level: 'Expert', credentialId: '28475D4E83BAE32B', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/28475D4E83BAE32B?sharingId=DD110D69941D2F8B' },
      { name: 'Microsoft Azure Solutions Architect Expert', code: 'AZ-305', level: 'Expert', credentialId: 'E5C0D4227B7B6F37', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/E5C0D4227B7B6F37?sharingId=DD110D69941D2F8B' },
      { name: 'Microsoft Azure Security Engineer Associate', code: 'AZ-500', level: 'Associate', credentialId: '7A377C3F6C178E4F', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/7A377C3F6C178E4F?sharingId=DD110D69941D2F8B' },
    ],
  },
  {
    provider: 'GitHub', logo: '/brands/github.svg', issuerUrl: 'https://resources.github.com/learn/certifications/',
    items: [
      { name: 'GitHub Foundations', code: 'Foundations', level: 'Foundational', credentialId: '3e8cf8d4-00d5-4390-a338-d3a43a6f001e', href: 'https://www.credly.com/badges/3e8cf8d4-00d5-4390-a338-d3a43a6f001e/linked_in?t=sjzzbr' },
    ],
  },
];

export const youtubeChannels: ChannelEntry[] = [
  { name: 'DevOpsea', logo: '/brands/youtube.svg', metric: audienceMetrics.devopsea.label, description: 'Cursos de Go con Gin, Revel, Echo, Gorilla y Fiber.', href: 'https://www.youtube.com/@DevOpsea?sub_confirmation=1', cta: 'Ir al canal' },
  { name: 'Side Master', logo: '/brands/youtube.svg', metric: audienceMetrics.sideMaster.label, description: 'Sesiones prácticas de aprendizaje autodidacta y programación.', href: 'https://www.youtube.com/@SideMaster?sub_confirmation=1', cta: 'Ir al canal' },
];

export const courses: Course[] = [
  { name: 'Fundamentos de los Frameworks Web en Go', framework: 'Fundamentos', visual: 'GO+', pathStep: 1, summary: 'Introducción comparativa a Revel, Gin, Echo, Gorilla y Fiber para entender cuándo elegir cada enfoque.', outcome: 'Comprender el mapa de frameworks antes de profundizar en uno.', access: 'Gratis', free: true, href: 'https://www.udemy.com/course/frameworks-web-en-go/' },
  { name: 'Desarrollo Web Go: Usando Gin, Revel, Echo, Gorilla y Fiber', framework: 'Comparativa', visual: 'GO', pathStep: 2, summary: 'Recorrido comparativo por cinco frameworks web de Go, desde la configuración del entorno hasta servidores web ejecutables localmente.', outcome: 'Comparar patrones y construir una base web funcional.', access: 'Acceso en Udemy', href: 'https://www.udemy.com/course/desarrollo-web-go-usando-gin-revel-echo-gorilla-y-fiber/' },
  { name: 'Desarrollo Web en Go con Gin Framework', framework: 'Gin', visual: 'GIN', pathStep: 3, summary: 'APIs web rápidas y eficientes con Gin, desde un entorno sencillo hasta una base preparada para crecer.', outcome: 'Construir APIs y rutas con un framework ligero.', access: 'Acceso en Udemy', href: 'https://www.udemy.com/course/desarrollo-web-en-go-con-gin-framework/' },
  { name: 'Desarrollo Web en Go con Echo Framework', framework: 'Echo', visual: 'ECHO', pathStep: 4, summary: 'Construcción rápida de aplicaciones web y APIs RESTful con las capacidades del framework Echo.', outcome: 'Diseñar una aplicación web y endpoints RESTful.', access: 'Acceso en Udemy', href: 'https://www.udemy.com/course/desarrollo-web-en-go-con-echo-framework/' },
  { name: 'Desarrollo Web en Go con Fiber Framework', framework: 'Fiber', visual: 'FIBER', pathStep: 5, summary: 'Aplicaciones web robustas y eficientes con Fiber, un framework de Go orientado a construir servicios rápidos.', outcome: 'Crear servicios web con una API expresiva y eficiente.', access: 'Acceso en Udemy', href: 'https://www.udemy.com/course/desarrollo-web-en-go-con-fiber-framework/' },
  { name: 'Desarrollo Web en Go con Gorilla Framework', framework: 'Gorilla', visual: 'GOR', pathStep: 6, summary: 'Desarrollo de aplicaciones web con el enfoque minimalista y flexible del ecosistema Gorilla para Go.', outcome: 'Componer rutas y componentes web con control explícito.', access: 'Acceso en Udemy', href: 'https://www.udemy.com/course/desarrollo-web-en-go-con-gorilla-framework/' },
  { name: 'Desarrollo Web en Go con Revel Framework', framework: 'Revel', visual: 'REVEL', pathStep: 7, summary: 'Aplicaciones web robustas en Go con Revel, incluyendo la puesta en marcha de un proyecto completo.', outcome: 'Levantar una aplicación web estructurada de extremo a extremo.', access: 'Acceso en Udemy', href: 'https://www.udemy.com/course/desarrollo-web-en-go-con-revel-framework/' },
];

export const openWebinarsCourses: OpenWebinarsCourse[] = [
  { name: 'Introducción a los Frameworks Web en Go', duration: '1 h 28 min', href: 'https://openwebinars.net/cursos/introduccion-frameworks-web-go/' },
  { name: 'Mi primera página web en Go', duration: '4 h 9 min', rating: '4.8', href: 'https://openwebinars.net/cursos/primera-pagina-web-go/' },
  { name: 'Desarrollo web con el Framework Gin en Go', duration: '2 h', rating: '5', href: 'https://openwebinars.net/cursos/desarrollo-web-framework-gin-go/' },
  { name: 'Desarrollo web con el Framework Echo en Go', duration: '1 h 28 min', href: 'https://openwebinars.net/cursos/desarrollo-web-framework-echo-go/' },
  { name: 'Desarrollo web con el Framework Fiber en Go', duration: '1 h 27 min', rating: '5', href: 'https://openwebinars.net/cursos/desarrollo-web-framework-fiber-go/' },
  { name: 'Desarrollo web con el Framework Gorilla en Go', duration: '1 h 25 min', rating: '5', href: 'https://openwebinars.net/cursos/desarrollo-web-framework-gorilla-go/' },
  { name: 'Desarrollo web con el Framework Revel en Go', duration: '1 h 12 min', rating: '5', href: 'https://openwebinars.net/cursos/desarrollo-web-framework-revel-go/' },
];

export const teaching: TeachingEntry[] = [
  { name: 'Udemy', logo: '/brands/udemy.svg', metrics: [audienceMetrics.udemy.label], description: 'Catálogo de cursos de desarrollo web con Go para una comunidad internacional.', cta: 'Ver cursos', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'DevOpsea', logo: '/brands/youtube.svg', metrics: [audienceMetrics.devopsea.label], description: 'Cursos de Go con Gin, Revel, Echo, Gorilla y Fiber.', cta: 'Ir al canal', href: 'https://www.youtube.com/@DevOpsea?sub_confirmation=1' },
  { name: 'Side Master', logo: '/brands/youtube.svg', metrics: [audienceMetrics.sideMaster.label], description: 'Sesiones prácticas de aprendizaje autodidacta y programación.', cta: 'Ir al canal', href: 'https://www.youtube.com/@SideMaster?sub_confirmation=1' },
  { name: 'OpenWebinars', logo: '/brands/openwebinars.svg', metrics: [audienceMetrics.openWebinarsArticles.label, audienceMetrics.openWebinarsCourses.label], description: 'Trabajo como escritor e instructor en cloud, observabilidad, Git, Go y DevOps.', cta: 'Ver perfil de instructor', href: 'https://openwebinars.net/profesores/antoniomorenosm/' },
];

export const cvLinks: CvLink[] = [
  { label: 'CV en español', href: 'https://docs.google.com/document/d/1r-Hpl-3WV1qDlLiUWJZkZ_7XFxrU1WgezGiaQnSrSkw/edit?usp=sharing', downloadHref: '/cv/jerson-martinez-cv-es.pdf', lang: 'es' },
  { label: 'CV in English', href: 'https://docs.google.com/document/d/18q3xhTd7bmymk-ZeMM_BHhJT6Qp4rLcxu05DozMQRYo/edit?usp=drive_link', downloadHref: '/cv/jerson-martinez-cv-en.pdf', lang: 'en' },
];

export const collaborationModes: CollaborationMode[] = [
  { title: 'Oportunidades profesionales', description: 'Roles DevOps, SRE, DevSecOps, plataforma y arquitectura cloud.', href: '/experience.html', cta: 'Revisar trayectoria', icon: 'fa-briefcase' },
  { title: 'Consultoría técnica', description: 'Gobierno cloud, automatización, CI/CD, IaC, observabilidad y mejora operativa.', href: '/projects.html', cta: 'Ver soluciones', icon: 'fa-project-diagram' },
  { title: 'Formación y contenido', description: 'Cursos, materiales y acompañamiento técnico sobre DevOps, Python y Go.', href: '/courses.html', cta: 'Explorar formación', icon: 'fa-graduation-cap' },
];

// Faceta de ESCRITOR y creador de contenido. Solo fuentes reales y verificables:
// el perfil público de autor en OpenWebinars (+60 artículos confirmados), los temas
// sobre los que escribe y los espacios propios. No se inventan títulos de artículos.
export const writing: Writing = {
  kicker: 'Escritura y divulgación',
  title: 'Escribo para que otros operen con criterio.',
  lede: 'Más de 60 artículos técnicos publicados y contenido propio sobre cloud, observabilidad, Git, Go y DevOps, convirtiendo experiencia de operación en material reutilizable.',
  topics: ['Cloud', 'Observabilidad', 'Git', 'Go', 'DevOps', 'Automatización'],
  outlets: [
    { name: 'OpenWebinars', role: 'Autor e instructor', metric: audienceMetrics.openWebinarsArticles.label, description: 'Artículos y cursos sobre cloud, Git, Go y DevOps en una plataforma de referencia en español.', href: 'https://openwebinars.net/profesores/antoniomorenosm/', cta: 'Ver perfil de autor', external: true },
    { name: 'Crashell', role: 'Cofundador · publicaciones', description: 'Espacio propio para publicar conocimiento práctico sobre cloud, sistemas, Docker, Git y automatización.', href: 'https://www.crashell.com/estudio', cta: 'Visitar Crashell', external: true },
  ],
};

// Valor hacia las empresas: resultados REPORTADOS ya documentados en la trayectoria,
// traducidos a lenguaje de negocio. Cada uno enlaza a su contexto verificable.
export const valueProps: ValueProp[] = [
  { metric: '−60%', label: 'costes de infraestructura', detail: 'Rediseño arquitectónico y uso eficiente de recursos.', href: '/experience.html#hotaka-ikhodi' },
  { metric: '+80%', label: 'calidad de backend', detail: 'Automatización, seguridad avanzada y mejora de procesos.', href: '/experience.html#elite-online-media' },
  { metric: '+60%', label: 'trazabilidad y seguridad', detail: 'Gobierno interno con GitHub Actions, Terraform y Ansible.', href: '/experience.html#pliret-prb' },
  { metric: '+77K', label: 'estudiantes formados', detail: 'Formación técnica en Udemy, OpenWebinars y YouTube.', href: '/courses.html' },
];

// Metodologías y marcos de gobierno aplicados (faceta de defensor de metodologías).
// Derivado de skills ya declarados; no añade nodos nuevos, solo los nombra juntos.
export const methodologies: string[] = ['GitOps', 'FinOps', 'DevSecOps', 'IaC', 'ITIL', 'ISO 27001', 'CI/CD', 'SRE'];
