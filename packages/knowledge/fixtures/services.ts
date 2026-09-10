import type { KnowledgeEntry } from "../types.js";

/**
 * Approved service knowledge — the set served to visitors.
 *
 * Reviewed claim by claim against the published copy in `src/data/services.js` and approved by
 * the content owner on 2026-08-27. `createChatApp` retrieves from these entries.
 *
 * Every claim is paraphrased from published copy. None states a price, timeframe, response time,
 * availability, or guarantee — a test rejects any digit in a claim, because the site publishes
 * none. Claims appear in Spanish, English and Portuguese because grounding validation checks an
 * answer against `claims` regardless of the reply language.
 *
 * Changing a claim is a content decision, not a code one: it needs the owner's re-approval and a
 * fresh `reviewedAt`. If an entry's meaning changes rather than its wording, give it a new `id`.
 */

const APPROVED_AT = "2026-08-27T00:00:00.000Z";
const REAPPROVAL_DUE = "2027-08-27T00:00:00.000Z";
const CONTENT_OWNER = "José Carrizo";

const guardrails = [
  "Do not state prices, timeframes, response times, availability, or guarantees.",
  "Do not name tools, brands, or certifications that the claims do not mention.",
];

function approved(
  entry: Omit<KnowledgeEntry, "status" | "owner" | "version" | "approvedAt" | "reviewedAt" | "reapprovalDueAt" | "validationRules">,
): KnowledgeEntry {
  return {
    ...entry,
    status: "approved",
    owner: CONTENT_OWNER,
    version: 1,
    approvedAt: APPROVED_AT,
    reviewedAt: APPROVED_AT,
    reapprovalDueAt: REAPPROVAL_DUE,
    validationRules: guardrails,
  };
}

export const approvedServiceEntries: KnowledgeEntry[] = [
  approved({
    id: "ciberseguridad-proteccion-datos",
    title: {
      es: "Ciberseguridad y protección de datos para empresas",
      en: "Cybersecurity and data protection for businesses",
      pt: "Cibersegurança e proteção de dados para empresas",
    },
    claims: [
      "iJAC diseña e implementa esquemas de ciberseguridad para proteger equipos, la red local y la información crítica del negocio.",
      "iJAC configura y administra firewalls, antivirus y anti malware, y gestiona usuarios y permisos.",
      "iJAC monitorea la red local, los accesos y los dispositivos conectados.",
      "iJAC designs and implements cybersecurity schemes to protect devices, the local network, and critical business information.",
      "iJAC configures and administers firewalls, antivirus and anti malware, and manages users and permissions.",
      "iJAC monitors the local network, access, and connected devices.",
      "A iJAC projeta e implementa esquemas de cibersegurança para proteger equipamentos, a rede local e as informações críticas do negócio.",
      "A iJAC configura e administra firewalls, antivírus e anti malware, e gerencia usuários e permissões.",
      "A iJAC monitora a rede local, os acessos e os dispositivos conectados.",
    ],
    aliases: {
      es: ["ciberseguridad", "seguridad informática", "protección de datos", "firewall", "antivirus"],
      en: ["cybersecurity", "information security", "data protection", "firewall", "antivirus"],
      pt: ["cibersegurança", "segurança da informação", "proteção de dados", "firewall", "antivírus"],
    },
    tags: ["security", "cybersecurity", "firewall", "antivirus", "network", "business"],
    url: "https://ijac.com.ar/services/ciberseguridad-proteccion-datos",
  }),

  approved({
    id: "armado-pcs-hardware",
    title: {
      es: "Armado de PCs y consultoría de hardware",
      en: "PC building and hardware consulting",
      pt: "Montagem de PCs e consultoria de hardware",
    },
    claims: [
      "iJAC asesora y arma computadoras personalizadas según el presupuesto, el tipo de uso y la vida útil esperada del equipo.",
      "iJAC optimiza equipos existentes, instala sistemas operativos y ayuda a elegir componentes compatibles.",
      "iJAC recomienda mejoras y actualizaciones futuras para equipos existentes.",
      "iJAC advises on and builds custom computers according to budget, intended use, and the expected service life of the machine.",
      "iJAC optimises existing machines, installs operating systems, and helps select compatible components.",
      "iJAC recommends future improvements and upgrades for existing machines.",
      "A iJAC assessora e monta computadores personalizados de acordo com o orçamento, o tipo de uso e a vida útil esperada do equipamento.",
      "A iJAC otimiza equipamentos existentes, instala sistemas operacionais e ajuda a escolher componentes compatíveis.",
      "A iJAC recomenda melhorias e atualizações futuras para equipamentos existentes.",
    ],
    aliases: {
      es: ["armado de pc", "hardware", "pc gamer", "componentes", "computadora a medida"],
      en: ["pc building", "hardware", "gaming pc", "components", "custom computer"],
      pt: ["montagem de pc", "hardware", "pc gamer", "componentes", "computador sob medida"],
    },
    tags: ["hardware", "pc", "components", "assembly", "performance"],
    url: "https://ijac.com.ar/services/armado-pcs-hardware",
  }),

  approved({
    id: "redes-wifi-cableado",
    title: {
      es: "Instalación de redes WiFi y cableado estructurado",
      en: "WiFi network and structured cabling installation",
      pt: "Instalação de redes WiFi e cabeamento estruturado",
    },
    claims: [
      "iJAC implementa redes WiFi y cableadas para oficinas, locales y hogares, con foco en estabilidad y cobertura.",
      "iJAC configura routers y puntos de acceso, y diagnostica fallas de conectividad.",
      "iJAC evalúa el espacio, ubica routers y puntos de acceso, y aplica segmentación básica de red.",
      "iJAC implements WiFi and wired networks for offices, shops, and homes, focused on stability and coverage.",
      "iJAC configures routers and access points, and diagnoses connectivity faults.",
      "iJAC assesses the space, places routers and access points, and applies basic network segmentation.",
      "A iJAC implementa redes WiFi e cabeadas para escritórios, lojas e residências, com foco em estabilidade e cobertura.",
      "A iJAC configura roteadores e pontos de acesso, e diagnostica falhas de conectividade.",
      "A iJAC avalia o espaço, posiciona roteadores e pontos de acesso, e aplica segmentação básica de rede.",
    ],
    aliases: {
      es: ["redes", "wifi", "cableado estructurado", "router", "conectividad", "red local"],
      en: ["networks", "wifi", "structured cabling", "router", "connectivity", "local network"],
      pt: ["redes", "wifi", "cabeamento estruturado", "roteador", "conectividade", "rede local"],
    },
    tags: ["network", "wifi", "cabling", "router", "connectivity", "infrastructure"],
    url: "https://ijac.com.ar/services/redes-wifi-cableado",
  }),

  approved({
    id: "soporte-tecnico-pc-mac-apple",
    title: {
      es: "Soporte técnico para PC, Mac y Apple",
      en: "Technical support for PC, Mac, and Apple devices",
      pt: "Suporte técnico para PC, Mac e Apple",
    },
    claims: [
      "iJAC atiende incidencias de hardware y software en PC, notebooks, equipos Mac y dispositivos Apple.",
      "iJAC realiza mantenimiento preventivo y correctivo, configuración inicial y resolución de errores.",
      "iJAC resuelve problemas de software, rendimiento y conectividad.",
      "iJAC brinda acompañamiento técnico a usuarios particulares, profesionales y pequeñas empresas.",
      "iJAC handles hardware and software incidents on PCs, laptops, Mac computers, and Apple devices.",
      "iJAC performs preventive and corrective maintenance, initial setup, and error resolution.",
      "iJAC resolves software, performance, and connectivity problems.",
      "iJAC provides technical support to individuals, professionals, and small businesses.",
      "A iJAC atende incidentes de hardware e software em PCs, notebooks, equipamentos Mac e dispositivos Apple.",
      "A iJAC realiza manutenção preventiva e corretiva, configuração inicial e resolução de erros.",
      "A iJAC resolve problemas de software, desempenho e conectividade.",
      "A iJAC oferece acompanhamento técnico a usuários particulares, profissionais e pequenas empresas.",
    ],
    aliases: {
      es: ["soporte técnico", "servicio técnico", "reparación", "mac", "macbook", "iphone", "ipad"],
      en: ["technical support", "it support", "repair", "mac", "macbook", "iphone", "ipad"],
      pt: ["suporte técnico", "assistência técnica", "reparo", "mac", "macbook", "iphone", "ipad"],
    },
    tags: ["support", "repair", "maintenance", "apple", "mac", "pc"],
    url: "https://ijac.com.ar/services/soporte-tecnico-pc-mac-apple",
  }),

  approved({
    id: "diseno-ux-ui",
    title: {
      es: "Diseño UX y UI",
      en: "UX and UI design",
      pt: "Design UX e UI",
    },
    claims: [
      "iJAC convierte objetivos de negocio y necesidades de usuarios en interfaces intuitivas.",
      "iJAC trabaja con investigación de usuarios, arquitectura de información, wireframes, prototipos y pruebas de usabilidad.",
      "iJAC define flujos clave y sistemas visuales coherentes para sitios, sistemas y aplicaciones.",
      "iJAC turns business goals and user needs into intuitive interfaces.",
      "iJAC works with user research, information architecture, wireframes, prototypes, and usability testing.",
      "iJAC defines key user flows and consistent visual systems for sites, systems, and applications.",
      "A iJAC converte objetivos de negócio e necessidades dos usuários em interfaces intuitivas.",
      "A iJAC trabalha com pesquisa de usuários, arquitetura da informação, wireframes, protótipos e testes de usabilidade.",
      "A iJAC define fluxos principais e sistemas visuais coerentes para sites, sistemas e aplicações.",
    ],
    aliases: {
      es: ["ux", "ui", "experiencia de usuario", "interfaz", "prototipo", "usabilidad"],
      en: ["ux", "ui", "user experience", "interface", "prototype", "usability"],
      pt: ["ux", "ui", "experiência do usuário", "interface", "protótipo", "usabilidade"],
    },
    tags: ["design", "ux", "ui", "interface", "usability", "prototype"],
    url: "https://ijac.com.ar/services/diseno-ux-ui",
  }),

  approved({
    id: "desarrollo-web-apps",
    title: {
      es: "Desarrollo de sitios web y aplicaciones móviles",
      en: "Website and mobile application development",
      pt: "Desenvolvimento de sites e aplicativos móveis",
    },
    claims: [
      "iJAC desarrolla sitios web, web apps y productos móviles con foco en experiencia de usuario, velocidad y mantenibilidad.",
      "iJAC trabaja desde una landing hasta soluciones a medida para procesos internos, ventas o atención al cliente.",
      "iJAC realiza optimización técnica para SEO y posicionamiento orgánico.",
      "iJAC ofrece mantenimiento evolutivo, ajustes y nuevas funcionalidades.",
      "iJAC develops websites, web apps, and mobile products focused on user experience, speed, and maintainability.",
      "iJAC works from a landing page through to custom solutions for internal processes, sales, or customer service.",
      "iJAC performs technical SEO optimisation and organic search positioning.",
      "iJAC offers ongoing maintenance, adjustments, and new features.",
      "A iJAC desenvolve sites, web apps e produtos móveis com foco em experiência do usuário, velocidade e manutenibilidade.",
      "A iJAC trabalha desde uma landing page até soluções sob medida para processos internos, vendas ou atendimento ao cliente.",
      "A iJAC realiza otimização técnica para SEO e posicionamento orgânico.",
      "A iJAC oferece manutenção evolutiva, ajustes e novas funcionalidades.",
    ],
    aliases: {
      es: ["desarrollo web", "sitio web", "página web", "aplicación móvil", "landing", "ecommerce", "responsive"],
      en: ["web development", "website", "web app", "mobile app", "landing page", "ecommerce", "responsive"],
      pt: ["desenvolvimento web", "site", "aplicativo móvel", "landing page", "ecommerce", "responsivo"],
    },
    tags: ["development", "web", "mobile", "apps", "seo", "performance"],
    url: "https://ijac.com.ar/services/desarrollo-web-apps",
  }),

  approved({
    id: "data-science-inteligencia-artificial",
    title: {
      es: "Data science e inteligencia artificial",
      en: "Data science and artificial intelligence",
      pt: "Ciência de dados e inteligência artificial",
    },
    claims: [
      "iJAC aplica análisis de datos, visualización, modelado predictivo e inteligencia artificial a problemas concretos del negocio.",
      "iJAC prioriza soluciones medibles y comprensibles para que los resultados se incorporen al trabajo diario.",
      "iJAC construye tableros y automatiza procesos y tareas con inteligencia artificial.",
      "iJAC applies data analysis, visualisation, predictive modelling, and artificial intelligence to concrete business problems.",
      "iJAC prioritises measurable and understandable solutions so results can be incorporated into daily work.",
      "iJAC builds dashboards and automates processes and tasks with artificial intelligence.",
      "A iJAC aplica análise de dados, visualização, modelagem preditiva e inteligência artificial a problemas concretos do negócio.",
      "A iJAC prioriza soluções mensuráveis e compreensíveis para que os resultados sejam incorporados ao trabalho diário.",
      "A iJAC constrói painéis e automatiza processos e tarefas com inteligência artificial.",
    ],
    aliases: {
      es: ["data science", "inteligencia artificial", "análisis de datos", "modelo predictivo", "automatización", "tableros"],
      en: ["data science", "artificial intelligence", "data analysis", "predictive model", "automation", "dashboards"],
      pt: ["ciência de dados", "inteligência artificial", "análise de dados", "modelo preditivo", "automação", "painéis"],
    },
    tags: ["data", "ai", "analytics", "automation", "modelling"],
    url: "https://ijac.com.ar/services/data-science-inteligencia-artificial",
  }),

  approved({
    id: "branding-marketing-digital",
    title: {
      es: "Branding y estrategia de marketing digital",
      en: "Branding and digital marketing strategy",
      pt: "Branding e estratégia de marketing digital",
    },
    claims: [
      "iJAC ayuda a construir una identidad visual y verbal consistente para empresas y profesionales.",
      "iJAC trabaja identidad visual, logotipo, lineamientos gráficos, tono de comunicación y estrategia de posicionamiento digital.",
      "iJAC helps build a consistent visual and verbal identity for companies and professionals.",
      "iJAC works on visual identity, logo, graphic guidelines, tone of communication, and digital positioning strategy.",
      "A iJAC ajuda a construir uma identidade visual e verbal consistente para empresas e profissionais.",
      "A iJAC trabalha identidade visual, logotipo, diretrizes gráficas, tom de comunicação e estratégia de posicionamento digital.",
    ],
    aliases: {
      es: ["branding", "marca", "identidad visual", "logo", "marketing digital", "posicionamiento", "guía de estilo"],
      en: ["branding", "brand", "visual identity", "logo", "digital marketing", "positioning", "style guide"],
      pt: ["branding", "marca", "identidade visual", "logotipo", "marketing digital", "posicionamento", "guia de estilo"],
    },
    tags: ["branding", "marketing", "identity", "logo", "strategy"],
    url: "https://ijac.com.ar/services/branding-marketing-digital",
  }),
];
