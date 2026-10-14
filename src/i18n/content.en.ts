/**
 * Solapamiento INGLÉS del contenido con datos.
 *
 * `src/data/portfolio.ts` sigue siendo la única fuente de verdad: aquí no se
 * duplica ni la estructura ni los enlaces ni las cifras, sólo el TEXTO legible.
 * Cada entrada se indexa por una clave que ya existe en el dato y que no es
 * texto visible (`experience.id`, `project.name`, el nombre de dominio de un
 * skill), de modo que reordenar los arrays no desalinea nada.
 *
 * Lo que NO se traduce, y por qué:
 *
 * - Los TÍTULOS de los cursos de Udemy y OpenWebinars. Son cursos impartidos en
 *   español: traducir el título anunciaría un producto que no existe. La versión
 *   inglesa conserva el título real y añade el aviso de idioma de `ui.ts`.
 * - Los nombres de las certificaciones y sus niveles: ya son los oficiales en
 *   inglés y cambiarlos rompería la correspondencia con el badge verificable.
 * - Los nombres de empresa, producto y tecnología.
 *
 * Una clave ausente NO rompe nada: el resolutor cae al español. El gate
 * `npm run validate` comprueba la cobertura, así que un registro nuevo sin
 * traducir se ve en CI en lugar de colarse silenciosamente.
 */

export const profileEn = {
  location: 'Latin America · GMT-6',
  headline: 'DevOps, SRE and DevSecOps engineer specialising in cloud platforms',
  intro: 'I design reliable cloud platforms, automate operations and turn governance into an advantage for teams.',
  /** Etiquetas de `profile.facts`, en el mismo orden que el dato. */
  factLabels: ['years of experience', 'Cloud Providers', 'certifications earned', 'articles published'],
  factMetaLabels: {
    '/certifications.html': 'See certifications and learning',
    'https://openwebinars.net/profesores/antoniomorenosm/': 'See author profile on OpenWebinars',
  } as Record<string, string>,
};

export const experienceLedeEn = (years: number) =>
  `More than ${years} years connecting technology projects, training, engineering, automation and cloud strategy.`;

export const audienceMetricsEn: Record<string, { label: string; longLabel?: string }> = {
  udemy: { label: '+77K students', longLabel: 'More than 77 thousand students' },
  devopsea: { label: '+14K subscribers' },
  sideMaster: { label: '+5K subscribers' },
  openWebinarsArticles: { label: '+60 articles' },
  openWebinarsCourses: { label: '7 courses taught' },
};

type SkillEn = { name: string; summary: string; evidence: string; relatedLabel: string; items?: string[] };

/** Indexado por `skill.name` del dato en español. */
export const skillsEn: Record<string, SkillEn> = {
  Infraestructura: {
    name: 'Infrastructure',
    summary: 'Hybrid operations focused on continuity, capacity and systems administration.',
    evidence: 'Infralytics made it possible to run operational actions on Windows and GNU/Linux servers from a web interface.',
    relatedLabel: 'See the Hotaka iKhodi role',
    items: ['Hybrid infrastructure (on-premises + cloud)', 'Windows Server', 'GNU/Linux', 'Microsoft Entra ID', 'Active Directory', 'IIS', 'DNS', 'DHCP', 'LDAP', 'NTP', 'Capacity planning', 'Right-sizing', 'BCP / DRP', 'High availability', 'Failover', 'Multi-AZ / Multi-region'],
  },
  Cloud: {
    name: 'Cloud',
    summary: 'Multi-cloud architecture and governance that turn the cloud into an operable platform.',
    evidence: 'Experience across AWS, Azure and GCP on Landing Zones, AWS MAP, migrations, automation and cloud governance.',
    relatedLabel: 'Walk through the cloud experience',
  },
  'Virtualización': {
    name: 'Virtualization',
    summary: 'Virtualised environments for labs, hybrid workloads and reproducible platforms.',
    evidence: 'The domain underpins hybrid operations and infrastructure automation.',
    relatedLabel: 'See infrastructure projects',
  },
  Contenedores: {
    name: 'Containers',
    summary: 'Packaging and orchestration for consistent environments from development to production.',
    evidence: 'Docker and Kubernetes are part of the stack applied to automation, delivery and platform modernisation.',
    relatedLabel: 'See docker-lamp',
  },
  IaC: {
    name: 'IaC',
    summary: 'Declarative, repeatable and traceable infrastructure as part of the delivery cycle.',
    evidence: 'Terraform, Ansible and Pulumi applied to governance, automation and deployments on AWS, Azure and GCP.',
    relatedLabel: 'See IaC across the career',
  },
  'DevOps & CI/CD': {
    name: 'DevOps & CI/CD',
    summary: 'Pipelines and standards that cut manual work and make delivery status visible.',
    evidence: 'GitHub Actions, GitOps and CI/CD automation run through consulting, leadership and open source alike.',
    relatedLabel: 'See Reusable Workflows',
    items: ['Git', 'GitHub Actions', 'Azure DevOps: Repos, Pipelines, Boards, Artifacts and Environments', 'Rundeck'],
  },
  Observabilidad: {
    name: 'Observability',
    summary: 'Telemetry to understand health, capacity and behaviour before an alert becomes an incident.',
    evidence: 'The stack combines Grafana, Prometheus, ELK, Datadog and infrastructure monitoring tools.',
    relatedLabel: 'See GNet',
  },
  'Storage & Backup': {
    name: 'Storage & Backup',
    summary: 'Persistence, protection and recovery as part of continuity design.',
    evidence: 'Managed services, snapshots and images are part of the cloud operations map.',
    relatedLabel: 'See cloud certifications',
  },
  'Seguridad y gobierno': {
    name: 'Security and governance',
    summary: 'Controls built into the lifecycle, not bolted on at the end.',
    evidence: 'GitOps, FinOps and DevSecOps applied alongside IAM, traceability, continuous security and multi-cloud governance.',
    relatedLabel: 'See governance experience',
  },
  'IA generativa': {
    name: 'Generative AI',
    summary: 'AI applied to knowledge, automation and operations with explicit controls.',
    evidence: 'Recent work includes GenAI assistants, RAG, model evaluation and AI-assisted engineering tooling.',
    relatedLabel: 'See Kiro Crew',
  },
  Desarrollo: {
    name: 'Development',
    summary: 'Code and scripting to connect APIs, platforms, automation and product.',
    evidence: 'Python, Go, Bash and PowerShell are recurring tools; the public MCP servers show implementations in Python and Go.',
    relatedLabel: 'See software projects',
  },
  'Bases de datos': {
    name: 'Databases',
    summary: 'Relational, document and in-memory persistence inside applications and platforms.',
    evidence: 'The professional stack includes MySQL, PostgreSQL, SQL Server, MongoDB, Redis and DynamoDB.',
    relatedLabel: 'See related projects',
  },
  Idiomas: {
    name: 'Languages',
    summary: 'Technical collaboration in Spanish and English with international teams and clients.',
    evidence: 'Native Spanish and B1 professional working English, per the updated CV.',
    relatedLabel: 'Get to know the profile',
    items: ['Spanish (native)', 'English (B1 · Professional Working Proficiency)'],
  },
};

type ProjectEn = { kind: string; theme: string; description: string; role: string; problem: string; contribution: string; outcome: string; cta: string };

/** Indexado por `project.name` (neutro: es el nombre propio del proyecto). */
export const projectsEn: Record<string, ProjectEn> = {
  Factib: {
    kind: 'Personal product', theme: 'Product · Applied AI · Platform',
    description: 'A personal product built to turn financial decisions into a clear, operable experience.',
    role: 'Product design and development', problem: 'Turn financial information into decisions people can understand.',
    contribution: 'Product, automation and operational experience.', outcome: 'An own project joining product engineering and financial clarity.',
    cta: 'Visit Factib',
  },
  Crashell: {
    kind: 'Product and publications', theme: 'Technical education · DevOps',
    description: 'An own space to publish practical knowledge on cloud, systems, Docker, Git and automation.',
    role: 'Co-founder and CEO', problem: 'Turn technical experience into services and reusable knowledge.',
    contribution: 'Direction, technical content and DevOps services.', outcome: 'A platform connecting professional practice, training and community.',
    cta: 'Visit Crashell',
  },
  'MCP GitHub Projects': {
    kind: 'Open source · creator', theme: 'AI + DevOps · Governance',
    description: 'An MCP server to manage GitHub Projects V2: issues, fields, workflows and automation from MCP clients.',
    role: 'Creator and maintainer', problem: 'Operate complex projects without repeating manual work in the UI.',
    contribution: 'Architecture, MCP tools, automation and documentation.', outcome: 'More than 100 public tools for project and workflow management.',
    cta: 'View repository',
  },
  'MCP Monday Projects': {
    kind: 'Open source · creator', theme: 'AI + DevOps · Operations',
    description: 'A high-performance MCP server for workspaces, boards, items and collaboration on monday.com.',
    role: 'Creator and maintainer', problem: 'Integrate agents and automation with real monday.com operations.',
    contribution: 'Go server, tool design, security and documentation.', outcome: 'Public automation of workspaces and collaboration flows.',
    cta: 'View repository',
  },
  'Kiro Crew': {
    kind: 'Open source · platform', theme: 'Agents · automation · orchestration',
    description: 'An agent and automation management layer with persistent memory, scheduled jobs and multi-session flows.',
    role: 'Creator and maintainer', problem: 'Coordinate autonomous work without losing context, control or traceability.',
    contribution: 'Orchestration, memory, automation and operator experience.', outcome: 'A public platform for multi-agent, multi-session work.',
    cta: 'View repository',
  },
  GNet: {
    kind: 'Academic project · 100 points', theme: 'Network management · GNU/Linux',
    description: 'A web system to manage GNU/Linux network and computing devices, built as a Telematics Engineering thesis.',
    role: 'Thesis author and developer', problem: 'Centralise management and visibility of GNU/Linux network devices.',
    contribution: 'Design and development of the web system.', outcome: 'Thesis graduated with honours and a score of 100 out of 100.',
    cta: 'View repository',
  },
  InfraQuiz: {
    kind: 'Open source · learning', theme: 'DevOps · hands-on practice',
    description: 'Interactive quizzes on DevOps tools and methodologies to reinforce knowledge and prepare for interviews or certifications.',
    role: 'Creator and maintainer', problem: 'Practise DevOps knowledge in a structured, interactive way.',
    contribution: 'Content, interface and repository maintenance.', outcome: 'A public resource for technical practice.',
    cta: 'View repository',
  },
  'Reusable Workflows': {
    kind: 'Open source · GitHub Actions', theme: 'CI/CD · standardisation',
    description: 'Reusable workflows to build consistent pipelines and cut duplication across repositories.',
    role: 'Creator and maintainer', problem: 'Stop every repository from reimplementing the same CI/CD controls from scratch.',
    contribution: 'Workflow design and reusable automation.', outcome: 'Shared pipelines under the Apache 2.0 licence.',
    cta: 'View repository',
  },
  'DevOps YouTube Channels': {
    kind: 'Technical content · automation', theme: 'Teaching · Go · Python · DevOps',
    description: 'Automation and presentation of content for DevOpsea and Side Master.',
    role: 'Content creator and developer', problem: 'Keep technical materials and channels tied to reproducible sources.',
    contribution: 'Automation, content and maintenance.', outcome: 'A public repository backing the teaching channels.',
    cta: 'View repository',
  },
  'docker-lamp': {
    kind: 'Open source · Docker Compose', theme: 'Docker · PHP · Apache · MySQL',
    description: 'A modern LAMP stack with Docker Compose for reproducible web development.',
    role: 'Creator and maintainer', problem: 'Reduce friction when standing up a LAMP development environment.',
    contribution: 'Service composition, interface and documentation.', outcome: 'A public environment with PHP 8.2, MySQL, phpMyAdmin and Apache.',
    cta: 'View repository',
  },
};

type ExperienceEn = { period: string; role: string; description: string; context?: string; relatedLabels?: string[] };

/** Indexado por `experience.id` (identificador estable, no texto visible). */
export const experienceEn: Record<string, ExperienceEn> = {
  'mindtech-nubity': {
    period: 'October 2025 — present', role: 'DevOps Tech Lead',
    description: 'Leading DevOps projects for clients across Latin America with GitOps, FinOps, DevSecOps, AWS/Azure governance, ETL migrations, GenAI assistants, AWS MAP and Landing Zones.',
    context: 'Current technical leadership role.', relatedLabels: ['See automation projects'],
  },
  'pliret-prb': {
    period: 'August 2025 — present', role: 'Sr. DevOps Engineer · Consultant',
    description: 'Internal governance, GitHub Actions, Terraform and Ansible on GCP; a reported 60% improvement in traceability, security and operational efficiency.',
    context: 'Consulting work concurrent with the main role.', relatedLabels: ['See governance skills'],
  },
  coderslab: {
    period: 'February — July 2025', role: 'DevOps Specialist',
    description: 'GitOps and CI/CD with AWS Lambda, API Gateway, Step Functions, DynamoDB, Terraform, GitHub Actions, Python and Node.js.',
    relatedLabels: ['See cloud experience'],
  },
  'hotaka-tech-lead': {
    period: 'February 2023 — February 2025', role: 'Tech Lead DevOps',
    description: 'Leading DevOps culture and cloud automation for high-performance teams and international clients.',
    relatedLabels: ['See projects'],
  },
  'hotaka-ikhodi': {
    period: 'September 2020 — February 2023', role: 'DevOps Engineer',
    description: 'Infrastructure optimisation with a reported 60% cost reduction. Built Infralytics in Python: a web application to run operational actions on Windows and GNU/Linux servers.',
    relatedLabels: ['See infrastructure skills'],
  },
  instructor: {
    period: 'February 2022 — present', role: 'DevOps and DevSecOps Instructor',
    description: 'Training thousands of students on GitHub Actions, Python, Flask and Go web frameworks.',
    relatedLabels: ['See courses'],
  },
  'elite-online-media': {
    period: 'January 2019 — September 2020', role: 'Full-Stack Developer',
    description: 'Automation, remote work and advanced security; a reported improvement of more than 80% in backend quality.',
    relatedLabels: ['See development projects'],
  },
  'independent-projects': {
    period: '2016 — 2018', role: 'Independent technology projects',
    description: 'Technology projects not detailed publicly, plus continuous learning; since December 2017, training on platforms such as Udemy and OpenWebinars alongside technical content on YouTube.',
    context: 'This period underpins the start of a career of more than 10 years without attributing unpublished projects or clients.',
    relatedLabels: ['See learning and certifications'],
  },
};

type CourseEn = { summary: string; outcome: string; access: string; framework?: string };

/**
 * Indexado por `course.name`. El NOMBRE no se traduce a propósito: el curso se
 * imparte en español y renombrarlo en inglés vendería algo inexistente.
 */
export const coursesEn: Record<string, CourseEn> = {
  'Fundamentos de los Frameworks Web en Go': {
    framework: 'Fundamentals',
    summary: 'A comparative introduction to Revel, Gin, Echo, Gorilla and Fiber to understand when to pick each approach.',
    outcome: 'Understand the framework landscape before going deep on one.', access: 'Free',
  },
  'Desarrollo Web Go: Usando Gin, Revel, Echo, Gorilla y Fiber': {
    framework: 'Comparison',
    summary: 'A comparative tour of five Go web frameworks, from environment setup to web servers you can run locally.',
    outcome: 'Compare patterns and build a working web foundation.', access: 'Available on Udemy',
  },
  'Desarrollo Web en Go con Gin Framework': {
    summary: 'Fast, efficient web APIs with Gin, from a simple environment to a base ready to grow.',
    outcome: 'Build APIs and routes with a lightweight framework.', access: 'Available on Udemy',
  },
  'Desarrollo Web en Go con Echo Framework': {
    summary: 'Rapid construction of web applications and RESTful APIs with the Echo framework.',
    outcome: 'Design a web application and RESTful endpoints.', access: 'Available on Udemy',
  },
  'Desarrollo Web en Go con Fiber Framework': {
    summary: 'Robust, efficient web applications with Fiber, a Go framework aimed at building fast services.',
    outcome: 'Create web services with an expressive, efficient API.', access: 'Available on Udemy',
  },
  'Desarrollo Web en Go con Gorilla Framework': {
    summary: 'Web application development with the minimal, flexible approach of the Gorilla ecosystem for Go.',
    outcome: 'Compose routes and web components with explicit control.', access: 'Available on Udemy',
  },
  'Desarrollo Web en Go con Revel Framework': {
    summary: 'Robust Go web applications with Revel, including standing up a complete project.',
    outcome: 'Stand up a structured web application end to end.', access: 'Available on Udemy',
  },
};

type OutletEn = { role: string; description: string; cta: string };

/** Indexado por `name`: cubre `teaching`, `youtubeChannels` y `writing.outlets`. */
export const outletsEn: Record<string, OutletEn> = {
  Udemy: { role: 'Instructor', description: 'A catalogue of Go web development courses for an international community.', cta: 'See courses' },
  DevOpsea: { role: 'Channel', description: 'Go courses covering Gin, Revel, Echo, Gorilla and Fiber.', cta: 'Go to channel' },
  'Side Master': { role: 'Channel', description: 'Hands-on sessions on self-taught learning and programming.', cta: 'Go to channel' },
  OpenWebinars: { role: 'Author and instructor', description: 'Articles and courses on cloud, Git, Go and DevOps on a leading Spanish-language platform.', cta: 'See author profile' },
  Crashell: { role: 'Co-founder · publications', description: 'An own space to publish practical knowledge on cloud, systems, Docker, Git and automation.', cta: 'Visit Crashell' },
};

/** `teaching[].cta` difiere del de `writing.outlets`; se resuelve por nombre. */
export const teachingCtaEn: Record<string, string> = {
  Udemy: 'See courses',
  DevOpsea: 'Go to channel',
  'Side Master': 'Go to channel',
  OpenWebinars: 'See instructor profile',
};

export const writingEn = {
  kicker: 'Writing and advocacy',
  title: 'I write so others can operate with judgement.',
  lede: 'More than 60 published technical articles and my own content on cloud, observability, Git, Go and DevOps, turning operational experience into reusable material.',
  topics: ['Cloud', 'Observability', 'Git', 'Go', 'DevOps', 'Automation'],
};

/** Indexado por `metric`, que es la cifra y por tanto neutra al idioma. */
export const valuePropsEn: Record<string, { label: string; detail: string }> = {
  '−60%': { label: 'infrastructure cost', detail: 'Architectural redesign and efficient resource use.' },
  '+80%': { label: 'backend quality', detail: 'Automation, advanced security and process improvement.' },
  '+60%': { label: 'traceability and security', detail: 'Internal governance with GitHub Actions, Terraform and Ansible.' },
  '+77K': { label: 'students trained', detail: 'Technical training on Udemy, OpenWebinars and YouTube.' },
};

/** Indexado por `collaborationModes[].icon`, estable y no visible. */
export const collaborationEn: Record<string, { title: string; description: string; cta: string }> = {
  'fa-briefcase': { title: 'Professional opportunities', description: 'DevOps, SRE, DevSecOps, platform and cloud architecture roles.', cta: 'Review experience' },
  'fa-project-diagram': { title: 'Technical consulting', description: 'Cloud governance, automation, CI/CD, IaC, observability and operational improvement.', cta: 'See solutions' },
  'fa-graduation-cap': { title: 'Training and content', description: 'Courses, materials and technical mentoring on DevOps, Python and Go.', cta: 'Explore training' },
};

/** Indexado por `cvLinks[].lang`. */
export const cvLabelsEn: Record<string, string> = {
  es: 'CV in Spanish',
  en: 'CV in English',
};
