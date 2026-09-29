export const profile = {
  name: 'Jerson Martínez',
  location: 'Latinoamérica · GMT-6',
  email: 'jersonmartinezsm@gmail.com',
  website: 'https://www.jersonmartinez.com',
  github: 'https://github.com/jersonmartinez',
  linkedin: 'https://www.linkedin.com/in/jersonmartinezsm/',
  intro: 'Diseño plataformas cloud confiables, automatizo operaciones y convierto la gobernanza en una ventaja para los equipos.',
  facts: [
    ['+10', 'años de experiencia'],
    ['3', 'Cloud Providers'],
    ['100+', 'cursos y certificaciones'],
    ['60+', 'artículos publicados']
  ]
};

export const skills = [
  { name: 'Infraestructura', icon: 'fa-server', items: ['Infraestructura híbrida (on-premises + cloud)', 'Windows Server', 'Linux', 'Microsoft Entra ID', 'Active Directory', 'IIS', 'DNS', 'DHCP', 'LDAP', 'NTP', 'Capacity planning', 'Right-sizing', 'BCP / DRP', 'High availability', 'Failover', 'Multi-AZ / Multi-region'] },
  { name: 'Cloud', icon: 'fa-cloud', items: ['AWS', 'Microsoft Azure', 'Google Cloud Platform (GCP)', 'AWS MAP', 'Landing Zones', 'Cloud Governance', 'Infrastructure Modernization'] },
  { name: 'Virtualización', icon: 'fa-layer-group', items: ['VMware vSphere', 'Hyper-V', 'KVM', 'VirtualBox', 'Vagrant'] },
  { name: 'Contenedores', icon: 'fa-cubes', items: ['Docker', 'Podman', 'WSLC', 'Kubernetes'] },
  { name: 'IaC', icon: 'fa-code-branch', items: ['Terraform', 'Ansible', 'Pulumi', 'CloudFormation', 'AWS SAM'] },
  { name: 'DevOps & CI/CD', icon: 'fa-code-commit', items: ['Git', 'GitHub Actions', 'Azure DevOps', 'Repos', 'Pipelines', 'Boards', 'Artifacts', 'Environments', 'Rundeck'] },
  { name: 'Observabilidad', icon: 'fa-chart-line', items: ['Grafana', 'Prometheus', 'ELK Stack', 'Filebeat', 'Telegraf', 'Datadog', 'Zabbix', 'SolarWinds', 'Nagios'] },
  { name: 'Storage & Backup', icon: 'fa-database', items: ['AWS EBS', 'AWS FSx', 'Azure Files', 'AWS Backup', 'Azure Backup', 'Snapshots', 'Amazon Machine Images (AMI)'] },
  { name: 'Seguridad', icon: 'fa-shield-alt', items: ['ITIL', 'ISO 27001', 'DevSecOps', 'FinOps', 'IAM', 'AWS Security Hub', 'GuardDuty', 'Inspector', 'Secrets Manager'] },
  { name: 'IA generativa', icon: 'fa-robot', items: ['RAG', 'LLM orchestration', 'Model evaluation', 'AWS Bedrock', 'Gemini', 'LibreChat', 'AI-assisted software engineering', 'Prompt and context management', 'Kiro', 'Devin', 'Claude Code', 'Cursor'] },
  { name: 'Desarrollo', icon: 'fa-terminal', items: ['Python', 'PowerShell', 'Bash', 'Go', 'JavaScript', 'PHP', 'HTML', 'CSS', 'SQL'] },
  { name: 'Bases de datos', icon: 'fa-database', items: ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Redis', 'DynamoDB'] },
  { name: 'Idiomas', icon: 'fa-language', items: ['Español (nativo)', 'English (B1+ · Professional Working Proficiency)'] }
];

export const projects = [
  {
    name: 'Factib',
    kind: 'Producto personal',
    theme: 'Producto · IA aplicada · Plataforma',
    description: 'Producto personal orientado a convertir decisiones financieras en una experiencia operable y clara.',
    tags: ['Product engineering', 'AI-ready', 'Automation'],
    featured: true
  },
  {
    name: 'Crashell',
    kind: 'Producto y publicaciones',
    theme: 'Educación técnica · DevOps',
    description: 'Espacio propio para publicar conocimiento práctico sobre cloud, sistemas, Docker, Git y automatización.',
    tags: ['Technical content', 'Docker', 'Git'],
    href: 'https://www.crashell.com/estudio',
    cta: 'Visitar Crashell',
    featured: true
  },
  {
    name: 'MCP GitHub Projects',
    kind: 'Open source · desarrollador oficial',
    theme: 'IA + DevOps · Gobernanza',
    description: 'Servidor MCP para administrar proyectos de GitHub: issues, campos, workflows y automatización desde clientes MCP.',
    tags: ['Python', 'MCP', 'GitHub API', 'Governance'],
    href: 'https://github.com/jersonmartinez/mcp-github-projects',
    cta: 'Ver repositorio',
    featured: true
  },
  {
    name: 'MCP Monday Projects',
    kind: 'Open source · desarrollador oficial',
    theme: 'IA + DevOps · Operaciones',
    description: 'Servidor MCP de alto rendimiento para workspaces, boards, items y flujos de colaboración en monday.com.',
    tags: ['Go', 'MCP', 'Monday.com', 'Automation'],
    href: 'https://github.com/jersonmartinez/mcp-monday-projects',
    cta: 'Ver repositorio',
    featured: true
  },
  {
    name: 'Kiro Crew',
    kind: 'Open source · plataforma',
    theme: 'Agentes · automatización · orquestación',
    description: 'Capa de gestión de agentes y automatizaciones con memoria persistente, jobs programados y flujos multi-sesión.',
    tags: ['Agent systems', 'Automation', 'Orchestration'],
    href: 'https://github.com/jersonmartinez/kiro-crew',
    cta: 'Ver repositorio',
    featured: true
  },
  {
    name: 'GNet',
    kind: 'Proyecto académico · 100 puntos',
    theme: 'Network management · GNU/Linux',
    description: 'Sistema web de gestión de red y dispositivos informáticos GNU/Linux, desarrollado como tesis de Ingeniería en Telemática.',
    tags: ['Networking', 'GNU/Linux', 'Monitoring'],
    href: 'https://github.com/jersonmartinez/GNet',
    cta: 'Ver repositorio'
  },
  {
    name: 'InfraQuiz',
    kind: 'Open source · aprendizaje',
    theme: 'DevOps · práctica técnica',
    description: 'Cuestionarios interactivos sobre herramientas y metodologías DevOps para practicar y preparar entrevistas.',
    tags: ['Python', 'Go', 'Kubernetes', 'Ansible'],
    href: 'https://github.com/jersonmartinez/InfraQuiz',
    cta: 'Ver repositorio'
  },
  {
    name: 'Reusable Workflows',
    kind: 'Open source · GitHub Actions',
    theme: 'CI/CD · estandarización',
    description: 'Workflows reutilizables para crear pipelines consistentes y reducir duplicación en repositorios.',
    tags: ['GitHub Actions', 'CI/CD', 'Automation'],
    href: 'https://github.com/jersonmartinez/reusable-workflows',
    cta: 'Ver repositorio'
  },
  {
    name: 'DevOps YouTube Channels',
    kind: 'Contenido técnico · desarrollado por Jerson',
    theme: 'Formación · Go · Python · DevOps',
    description: 'Automatización y presentación de contenido para los canales DevOpsea y Side Master, con cursos y sesiones sobre herramientas de ingeniería.',
    tags: ['YouTube', 'Go', 'Python', 'Teaching'],
    href: 'https://github.com/jersonmartinez/DevOps-YouTube-Channels',
    cta: 'Ver repositorio'
  },
  {
    name: 'docker-lamp',
    kind: 'Open source · 122 estrellas',
    theme: 'Docker · PHP · Apache · MySQL',
    description: 'Stack LAMP moderno con Docker Compose para desarrollo web reproducible.',
    tags: ['Docker Compose', 'PHP', 'MySQL'],
    href: 'https://github.com/jersonmartinez/docker-lamp',
    cta: 'Ver repositorio'
  }
];

export const experience = [
  ['2025 — actualidad', 'DevOps Tech Lead', 'MindTech — Nubity', 'GitOps, FinOps, DevSecOps, gobernanza multi-cloud, migraciones ETL, asistentes GenAI, AWS MAP y Landing Zones.'],
  ['2025 — actualidad', 'Sr. DevOps Engineer · Consultor', 'Pliret — PRB', 'Gobernanza interna, GitHub Actions, Terraform y Ansible sobre GCP; mejora reportada del 60% en trazabilidad, seguridad y eficiencia.'],
  ['2025', 'DevOps Specialist', 'CodersLab · Coca-Cola Andina', 'GitOps y CI/CD con AWS Lambda, API Gateway, Step Functions, DynamoDB, Terraform, GitHub Actions, Python y Node.js.'],
  ['2023 — 2025', 'Tech Lead DevOps', 'Hotaka iKhodi', 'Liderazgo de cultura DevOps y automatización cloud para equipos de alto rendimiento y clientes internacionales.'],
  ['2020 — 2023', 'DevOps Engineer', 'Hotaka iKhodi', 'Optimización de infraestructura con reducción reportada del 60% en costes y desarrollo de Infralytics.'],
  ['2022 — actualidad', 'Instructor DevOps y DevSecOps', 'OpenWebinars · Udemy · YouTube', 'Cursos para miles de estudiantes sobre GitHub Actions, Python, Flask y frameworks Go: Gin, Revel, Echo, Gorilla y Fiber.'],
  ['2019 — 2020', 'Full-Stack Developer', 'Elite Online Media', 'Automatización y seguridad avanzada; mejora reportada superior al 80% en calidad backend.']
];

export const certifications = [
  {
    provider: 'AWS',
    logo: '/brands/aws.svg',
    items: [
      { name: 'Cloud Practitioner (CCP)', href: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/2HHK4HSBFFF118SH' },
      { name: 'Solutions Architect — Associate (SAA)', href: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/9d4c32d819004186b71dd30d50cf81f8' },
      { name: 'DevOps Engineer — Professional (DOP-C02)', href: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/bad6589844784db59d2b7da6385549ee' }
    ]
  },
  {
    provider: 'Microsoft Azure',
    logo: '/brands/azure.svg',
    items: [
      { name: 'Fundamentals (AZ-900)', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/44AAF997D4FC41F1?sharingId=DD110D69941D2F8B' },
      { name: 'Data Fundamentals (DP-900)', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/8093C64EDF8D16D1?sharingId=DD110D69941D2F8B' },
      { name: 'Administrator Associate (AZ-104)', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/19489B0720DDF744?sharingId=DD110D69941D2F8B' },
      { name: 'DevOps Engineer Expert (AZ-400)', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/28475D4E83BAE32B?sharingId=DD110D69941D2F8B' },
      { name: 'Solutions Architect Expert (AZ-305)', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/E5C0D4227B7B6F37?sharingId=DD110D69941D2F8B' },
      { name: 'Security Engineer Associate (AZ-500)', href: 'https://learn.microsoft.com/api/credentials/share/en-us/jersonmartinezsm/7A377C3F6C178E4F?sharingId=DD110D69941D2F8B' }
    ]
  },
  {
    provider: 'GitHub',
    logo: '/brands/github.png',
    items: [{ name: 'GitHub Foundations', href: 'https://www.credly.com/badges/3e8cf8d4-00d5-4390-a338-d3a43a6f001e/linked_in?t=sjzzbr' }, { name: 'GitHub Actions', href: 'https://github.com/jersonmartinez' }, { name: 'Gobernanza de repositorios y delivery', href: 'https://github.com/jersonmartinez' }]
  }
];

export const youtubeChannels = [
  { name: 'DevOpsea', logo: 'https://cdn.simpleicons.org/youtube/FF0000', subscribers: '15K+', metric: 'Más de 15K suscriptores', description: 'Cursos de Go con Gin, Revel, Echo, Gorilla y Fiber.', href: 'https://www.youtube.com/@DevOpsea?sub_confirmation=1' },
  { name: 'Side Master', logo: 'https://cdn.simpleicons.org/youtube/FF0000', subscribers: '4.1K', metric: '≈ 4.1K suscriptores', description: 'Sesiones prácticas de aprendizaje autodidacta y programación.', href: 'https://www.youtube.com/@SideMaster?sub_confirmation=1' }
];

export const courses = [
  { name: 'Desarrollo Web Go: Usando Gin, Echo, Gorilla y Fiber', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'Desarrollo Web en Go con Fiber Framework', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'Desarrollo Web en Go con Gorilla Framework', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'Desarrollo Web en Go con Echo Framework', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'Desarrollo Web en Go con Gin Framework', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'Desarrollo Web en Go con Revel Framework', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'Fundamentos de los Frameworks Web en Go', href: 'https://www.udemy.com/user/side-master/' }
];

export const teaching = [
  { name: 'Udemy', logo: 'https://cdn.simpleicons.org/udemy/A435F0', metric: 'Más de 77 mil estudiantes · 7 cursos', description: 'Cursos de DevOps y desarrollo web publicados para una comunidad internacional.', href: 'https://www.udemy.com/user/side-master/' },
  { name: 'DevOpsea', logo: 'https://cdn.simpleicons.org/youtube/FF0000', metric: 'Más de 15K suscriptores', description: 'Cursos de Go con Gin, Revel, Echo, Gorilla y Fiber.', href: 'https://www.youtube.com/@DevOpsea?sub_confirmation=1' },
  { name: 'Side Master', logo: 'https://cdn.simpleicons.org/youtube/FF0000', metric: '≈ 4.1K suscriptores', description: 'Sesiones prácticas de aprendizaje autodidacta y programación.', href: 'https://www.youtube.com/@SideMaster?sub_confirmation=1' },
  { name: 'OpenWebinars', logo: '/brands/openwebinars.svg', metric: '60+ artículos', description: 'Contenido sobre cloud, observabilidad, Git y DevOps.', href: 'https://openwebinars.net/profesores/antoniomorenosm/' }
];

export const cvLinks = [
  ['CV en español', 'https://docs.google.com/document/d/1r-Hpl-3WV1qDlLiUWJZkZ_7XFxrU1WgezGiaQnSrSkw/edit?usp=sharing'],
  ['CV in English', 'https://docs.google.com/document/d/1aYwQcfaZAgsv0OWtSb56qzilAySD_xYH7YJbdNMnRl0/edit?usp=sharing']
];
