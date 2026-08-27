import type { KnowledgeEntry } from "../types";

/**
 * DRAFT service knowledge — awaiting content-owner approval.
 *
 * Every entry is `status: "draft"`, which `approvedKnowledgeEntrySchema` rejects, so retrieval
 * drops all of it. This file is deliberately NOT wired into `createChatApp`; it exists to be
 * reviewed, corrected, and only then promoted.
 *
 * Claims are paraphrased from the published copy in `src/data/services.js` — nothing here states
 * a price, a timeframe, a response time, or a guarantee, because the site does not publish any.
 * Claims appear in Spanish, English and Portuguese because grounding validation checks an answer
 * against `claims` regardless of the reply language.
 *
 * To approve an entry:
 *   1. Verify each claim against the live service page.
 *   2. Replace `owner` with the accountable person.
 *   3. Set `approvedAt` and `reviewedAt` to the real approval date, and `reapprovalDueAt` to the
 *      next review date — the values below are drafting placeholders.
 *   4. Change `status` to "approved" and move the entry into the served fixture set.
 */

const DRAFTED_AT = "2026-08-27T00:00:00.000Z";
const REVIEW_DUE = "2027-08-27T00:00:00.000Z";

const guardrails = [
  "Do not state prices, timeframes, response times, availability, or guarantees.",
  "Do not name tools, brands, or certifications that the claims do not mention.",
];

function draft(
  entry: Omit<KnowledgeEntry, "status" | "owner" | "version" | "approvedAt" | "reviewedAt" | "reapprovalDueAt" | "validationRules">,
): KnowledgeEntry {
  return {
    ...entry,
    status: "draft",
    owner: "pending-approval",
    version: 1,
    approvedAt: DRAFTED_AT,
    reviewedAt: DRAFTED_AT,
    reapprovalDueAt: REVIEW_DUE,
    validationRules: guardrails,
  };
}

export const draftServiceEntries: KnowledgeEntry[] = [
  draft({
    id: "ciberseguridad-proteccion-datos",
    title: {
      es: "Ciberseguridad y protección de datos para empresas",
      en: "Cybersecurity and data protection for businesses",
      pt: "Cibersegurança e proteção de dados para empresas",
    },
    claims: [
      "iJAC diseña e implementa esquemas de ciberseguridad para proteger equipos, la red local y la información crítica del negocio.",
      "iJAC configura y administra firewalls, antivirus y anti malware, y gestiona usuarios y permisos.",
      "iJAC designs and implements cybersecurity schemes to protect devices, the local network, and critical business information.",
      "iJAC configures and administers firewalls, antivirus and anti malware, and manages users and permissions.",
      "A iJAC projeta e implementa esquemas de cibersegurança para proteger equipamentos, a rede local e as informações críticas do negócio.",
      "A iJAC configura e administra firewalls, antivírus e anti malware, e gerencia usuários e permissões.",
    ],
    aliases: {
      es: ["ciberseguridad", "seguridad informática", "protección de datos", "firewall", "antivirus"],
      en: ["cybersecurity", "information security", "data protection", "firewall", "antivirus"],
      pt: ["cibersegurança", "segurança da informação", "proteção de dados", "firewall", "antivírus"],
    },
    tags: ["security", "cybersecurity", "firewall", "antivirus", "network", "business"],
    url: "https://ijac.com.ar/services/ciberseguridad-proteccion-datos",
  }),

  draft({
    id: "armado-pcs-hardware",
    title: {
      es: "Armado de PCs y consultoría de hardware",
      en: "PC building and hardware consulting",
      pt: "Montagem de PCs e consultoria de hardware",
    },
    claims: [
      "iJAC asesora y arma computadoras personalizadas según el presupuesto, el tipo de uso y la vida útil esperada del equipo.",
      "iJAC optimiza equipos existentes, instala sistemas operativos y ayuda a elegir componentes compatibles.",
      "iJAC advises on and builds custom computers according to budget, intended use, and the expected service life of the machine.",
      "iJAC optimises existing machines, installs operating systems, and helps select compatible components.",
      "A iJAC assessora e monta computadores personalizados de acordo com o orçamento, o tipo de uso e a vida útil esperada do equipamento.",
      "A iJAC otimiza equipamentos existentes, instala sistemas operacionais e ajuda a escolher componentes compatíveis.",
    ],
    aliases: {
      es: ["armado de pc", "hardware", "pc gamer", "componentes", "computadora a medida"],
      en: ["pc building", "hardware", "gaming pc", "components", "custom computer"],
      pt: ["montagem de pc", "hardware", "pc gamer", "componentes", "computador sob medida"],
    },
    tags: ["hardware", "pc", "components", "assembly", "performance"],
    url: "https://ijac.com.ar/services/armado-pcs-hardware",
  }),

  draft({
    id: "redes-wifi-cableado",
    title: {
      es: "Instalación de redes WiFi y cableado estructurado",
      en: "WiFi network and structured cabling installation",
      pt: "Instalação de redes WiFi e cabeamento estruturado",
    },
    claims: [
      "iJAC implementa redes WiFi y cableadas para oficinas, locales y hogares, con foco en estabilidad y cobertura.",
      "iJAC configura routers y puntos de acceso, y diagnostica fallas de conectividad.",
      "iJAC implements WiFi and wired networks for offices, shops, and homes, focused on stability and coverage.",
      "iJAC configures routers and access points, and diagnoses connectivity faults.",
      "A iJAC implementa redes WiFi e cabeadas para escritórios, lojas e residências, com foco em estabilidade e cobertura.",
      "A iJAC configura roteadores e pontos de acesso, e diagnostica falhas de conectividade.",
    ],
    aliases: {
      es: ["redes", "wifi", "cableado estructurado", "router", "conectividad", "red local"],
      en: ["networks", "wifi", "structured cabling", "router", "connectivity", "local network"],
      pt: ["redes", "wifi", "cabeamento estruturado", "roteador", "conectividade", "rede local"],
    },
    tags: ["network", "wifi", "cabling", "router", "connectivity", "infrastructure"],
    url: "https://ijac.com.ar/services/redes-wifi-cableado",
  }),

  draft({
    id: "soporte-tecnico-pc-mac-apple",
    title: {
      es: "Soporte técnico para PC, Mac y Apple",
      en: "Technical support for PC, Mac, and Apple devices",
      pt: "Suporte técnico para PC, Mac e Apple",
    },
    claims: [
      "iJAC atiende incidencias de hardware y software en PC, notebooks, equipos Mac y dispositivos Apple.",
      "iJAC realiza mantenimiento preventivo y correctivo, configuración inicial y resolución de errores.",
      "iJAC handles hardware and software incidents on PCs, laptops, Mac computers, and Apple devices.",
      "iJAC performs preventive and corrective maintenance, initial setup, and error resolution.",
      "A iJAC atende incidentes de hardware e software em PCs, notebooks, equipamentos Mac e dispositivos Apple.",
      "A iJAC realiza manutenção preventiva e corretiva, configuração inicial e resolução de erros.",
    ],
    aliases: {
      es: ["soporte técnico", "servicio técnico", "reparación", "mac", "macbook", "iphone", "ipad"],
      en: ["technical support", "it support", "repair", "mac", "macbook", "iphone", "ipad"],
      pt: ["suporte técnico", "assistência técnica", "reparo", "mac", "macbook", "iphone", "ipad"],
    },
    tags: ["support", "repair", "maintenance", "apple", "mac", "pc"],
    url: "https://ijac.com.ar/services/soporte-tecnico-pc-mac-apple",
  }),

  draft({
    id: "diseno-ux-ui",
    title: {
      es: "Diseño UX y UI",
      en: "UX and UI design",
      pt: "Design UX e UI",
    },
    claims: [
      "iJAC convierte objetivos de negocio y necesidades de usuarios en interfaces intuitivas.",
      "iJAC trabaja con investigación de usuarios, arquitectura de información, wireframes, prototipos y pruebas de usabilidad.",
      "iJAC turns business goals and user needs into intuitive interfaces.",
      "iJAC works with user research, information architecture, wireframes, prototypes, and usability testing.",
      "A iJAC converte objetivos de negócio e necessidades dos usuários em interfaces intuitivas.",
      "A iJAC trabalha com pesquisa de usuários, arquitetura da informação, wireframes, protótipos e testes de usabilidade.",
    ],
    aliases: {
      es: ["ux", "ui", "experiencia de usuario", "interfaz", "prototipo", "usabilidad"],
      en: ["ux", "ui", "user experience", "interface", "prototype", "usability"],
      pt: ["ux", "ui", "experiência do usuário", "interface", "protótipo", "usabilidade"],
    },
    tags: ["design", "ux", "ui", "interface", "usability", "prototype"],
    url: "https://ijac.com.ar/services/diseno-ux-ui",
  }),

  draft({
    id: "desarrollo-web-apps",
    title: {
      es: "Desarrollo de sitios web y aplicaciones móviles",
      en: "Website and mobile application development",
      pt: "Desenvolvimento de sites e aplicativos móveis",
    },
    claims: [
      "iJAC desarrolla sitios web, web apps y productos móviles con foco en experiencia de usuario, velocidad y mantenibilidad.",
      "iJAC trabaja desde una landing hasta soluciones a medida para procesos internos, ventas o atención al cliente.",
      "iJAC develops websites, web apps, and mobile products focused on user experience, speed, and maintainability.",
      "iJAC works from a landing page through to custom solutions for internal processes, sales, or customer service.",
      "A iJAC desenvolve sites, web apps e produtos móveis com foco em experiência do usuário, velocidade e manutenibilidade.",
      "A iJAC trabalha desde uma landing page até soluções sob medida para processos internos, vendas ou atendimento ao cliente.",
    ],
    aliases: {
      es: ["desarrollo web", "sitio web", "página web", "aplicación móvil", "landing", "ecommerce"],
      en: ["web development", "website", "web app", "mobile app", "landing page", "ecommerce"],
      pt: ["desenvolvimento web", "site", "aplicativo móvel", "landing page", "ecommerce"],
    },
    tags: ["development", "web", "mobile", "apps", "seo", "performance"],
    url: "https://ijac.com.ar/services/desarrollo-web-apps",
  }),

  draft({
    id: "data-science-inteligencia-artificial",
    title: {
      es: "Data science e inteligencia artificial",
      en: "Data science and artificial intelligence",
      pt: "Ciência de dados e inteligência artificial",
    },
    claims: [
      "iJAC aplica análisis de datos, visualización, modelado predictivo e inteligencia artificial a problemas concretos del negocio.",
      "iJAC prioriza soluciones medibles y comprensibles para que los resultados se incorporen al trabajo diario.",
      "iJAC applies data analysis, visualisation, predictive modelling, and artificial intelligence to concrete business problems.",
      "iJAC prioritises measurable and understandable solutions so results can be incorporated into daily work.",
      "A iJAC aplica análise de dados, visualização, modelagem preditiva e inteligência artificial a problemas concretos do negócio.",
      "A iJAC prioriza soluções mensuráveis e compreensíveis para que os resultados sejam incorporados ao trabalho diário.",
    ],
    aliases: {
      es: ["data science", "inteligencia artificial", "análisis de datos", "modelo predictivo", "automatización"],
      en: ["data science", "artificial intelligence", "data analysis", "predictive model", "automation"],
      pt: ["ciência de dados", "inteligência artificial", "análise de dados", "modelo preditivo", "automação"],
    },
    tags: ["data", "ai", "analytics", "automation", "modelling"],
    url: "https://ijac.com.ar/services/data-science-inteligencia-artificial",
  }),

  draft({
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
      es: ["branding", "marca", "identidad visual", "logo", "marketing digital", "posicionamiento"],
      en: ["branding", "brand", "visual identity", "logo", "digital marketing", "positioning"],
      pt: ["branding", "marca", "identidade visual", "logotipo", "marketing digital", "posicionamento"],
    },
    tags: ["branding", "marketing", "identity", "logo", "strategy"],
    url: "https://ijac.com.ar/services/branding-marketing-digital",
  }),
];
