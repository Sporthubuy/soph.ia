export type SetupTemplateId =
  | "blank"
  | "startup"
  | "saas"
  | "ecommerce"
  | "services"
  | "sports";

export type SetupModule = {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
};

export type SetupTemplate = {
  id: SetupTemplateId;
  name: string;
  tagline: string;
  description: string;
  recommendedCount: { min: number; max: number };
  modules: SetupModule[];
  starterKus: { title: string; domainName: string; content: string }[];
};

export const SETUP_TEMPLATES: SetupTemplate[] = [
  {
    id: "blank",
    name: "Desde cero",
    tagline: "Vos definis todo",
    description:
      "Empeza con un dominio General y construi tu arbol de conocimiento a medida.",
    recommendedCount: { min: 1, max: 4 },
    modules: [
      {
        id: "general",
        name: "General",
        description: "Conocimiento transversal de la organizacion",
        recommended: true,
      },
    ],
    starterKus: [
      {
        title: "Como usamos SOPH.IA en esta organizacion",
        domainName: "General",
        content: `# Como usamos SOPH.IA

## Proposito
Este es el espacio donde documentamos el conocimiento que alimenta a nuestros agentes de IA.

## Reglas basicas
1. Cada Knowledge Unit tiene un responsable.
2. Los cambios se proponen; no se sobrescriben.
3. Solo el conocimiento aprobado se compila en agentes.

## Proximos pasos
- [ ] Crear dominios por area
- [ ] Documentar la primera politica o proceso
- [ ] Proponer un cambio y revisarlo
- [ ] Compilar el primer agente`,
      },
    ],
  },
  {
    id: "startup",
    name: "Startup / Pyme",
    tagline: "4–6 modulos tipicos",
    description:
      "Ideal para equipos chicos que necesitan ordenar operaciones, producto y ventas rapido.",
    recommendedCount: { min: 4, max: 6 },
    modules: [
      {
        id: "general",
        name: "General",
        description: "Vision, cultura y decisiones transversales",
        recommended: true,
      },
      {
        id: "producto",
        name: "Producto",
        description: "Roadmap, features y criterios de prioridad",
        recommended: true,
      },
      {
        id: "ventas",
        name: "Ventas",
        description: "Proceso comercial, precios y objeciones",
        recommended: true,
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Tono de marca, canales y campanas",
        recommended: true,
      },
      {
        id: "operaciones",
        name: "Operaciones",
        description: "Procesos internos y soporte",
        recommended: true,
      },
      {
        id: "legal",
        name: "Legal",
        description: "Terminos, privacidad y contratos",
        recommended: false,
      },
    ],
    starterKus: [
      {
        title: "Vision y propuesta de valor",
        domainName: "General",
        content: `# Vision y propuesta de valor

## A quien servimos
Describe tu cliente ideal en 2–3 oraciones.

## Problema que resolvemos
...

## Propuesta de valor unica
...

## Lo que NO hacemos
...`,
      },
      {
        title: "Proceso de ventas (playbook)",
        domainName: "Ventas",
        content: `# Playbook de ventas

## Etapas del funnel
1. Lead
2. Discovery
3. Demo / propuesta
4. Cierre
5. Onboarding

## SLA de respuesta
- Primer contacto: < 24h habiles

## Objeciones frecuentes
- Precio → ...
- Timing → ...`,
      },
    ],
  },
  {
    id: "saas",
    name: "SaaS / Producto digital",
    tagline: "5–7 modulos",
    description:
      "Enfocado en producto, soporte, pricing y governance de conocimiento para agentes.",
    recommendedCount: { min: 5, max: 7 },
    modules: [
      {
        id: "general",
        name: "General",
        description: "Principios y governance",
        recommended: true,
      },
      {
        id: "producto",
        name: "Producto",
        description: "Roadmap y specs",
        recommended: true,
      },
      {
        id: "soporte",
        name: "Soporte",
        description: "FAQs y protocolos de atencion",
        recommended: true,
      },
      {
        id: "pricing",
        name: "Pricing",
        description: "Planes, limites y upgrades",
        recommended: true,
      },
      {
        id: "seguridad",
        name: "Seguridad",
        description: "Politicas de acceso y datos",
        recommended: true,
      },
      {
        id: "legal",
        name: "Legal",
        description: "Terminos y privacidad",
        recommended: false,
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Messaging y posicionamiento",
        recommended: false,
      },
    ],
    starterKus: [
      {
        title: "Planes y limites del producto",
        domainName: "Pricing",
        content: `# Planes y limites

| Plan | Precio | Limites clave |
|------|--------|---------------|
| Free | $0 | ... |
| Pro | $... | ... |
| Enterprise | Custom | ... |

## Politica de upgrades
...

## Politica de downgrades
...`,
      },
      {
        title: "Protocolo de soporte L1",
        domainName: "Soporte",
        content: `# Soporte L1

## Canales
- Chat, email, ticket

## Tiempos de respuesta
- Critico: 1h
- Alto: 4h
- Normal: 1 dia habil

## Cuando escalar a L2
- Bugs de produccion
- Incidentes de seguridad
- Disputas de facturacion`,
      },
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce / Retail",
    tagline: "4–6 modulos",
    description:
      "Devoluciones, atencion, catalogo y marketing listos para agentes de soporte.",
    recommendedCount: { min: 4, max: 6 },
    modules: [
      {
        id: "general",
        name: "General",
        description: "Politicas de la tienda",
        recommended: true,
      },
      {
        id: "atencion",
        name: "Atencion al cliente",
        description: "Respuestas y escalados",
        recommended: true,
      },
      {
        id: "logistica",
        name: "Logistica",
        description: "Envios y plazos",
        recommended: true,
      },
      {
        id: "legal",
        name: "Legal",
        description: "Devoluciones y garantias",
        recommended: true,
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Promos y tono de marca",
        recommended: false,
      },
      {
        id: "producto",
        name: "Catalogo",
        description: "Reglas de producto y stock",
        recommended: false,
      },
    ],
    starterKus: [
      {
        title: "Politica de devoluciones",
        domainName: "Legal",
        content: `# Politica de devoluciones

## Plazo
30 dias desde la compra.

## Condiciones
- Empaque original
- Comprobante de compra

## Proceso
1. Solicitud del cliente
2. Evaluacion (48h)
3. Etiqueta de envio
4. Reembolso (5 dias habiles)`,
      },
    ],
  },
  {
    id: "services",
    name: "Servicios profesionales",
    tagline: "4–5 modulos",
    description:
      "Consultoras, agencias y estudios: metodologias, clientes y delivery.",
    recommendedCount: { min: 4, max: 5 },
    modules: [
      {
        id: "general",
        name: "General",
        description: "Metodologia y cultura",
        recommended: true,
      },
      {
        id: "clientes",
        name: "Clientes",
        description: "Onboarding y relacion",
        recommended: true,
      },
      {
        id: "delivery",
        name: "Delivery",
        description: "Procesos de entrega",
        recommended: true,
      },
      {
        id: "comercial",
        name: "Comercial",
        description: "Propuestas y pricing",
        recommended: true,
      },
      {
        id: "legal",
        name: "Legal",
        description: "Contratos y NDAs",
        recommended: false,
      },
    ],
    starterKus: [
      {
        title: "Onboarding de clientes",
        domainName: "Clientes",
        content: `# Onboarding de clientes

## Kickoff (semana 1)
- Objetivos y KPIs
- Stakeholders
- Canales de comunicacion

## Entregables del primer mes
...

## Escalamiento
...`,
      },
    ],
  },
  {
    id: "sports",
    name: "Deporte / Wellness",
    tagline: "5–6 modulos",
    description:
      "Gimnasios, apps fitness y clubs: coaches, planes, operaciones y marca.",
    recommendedCount: { min: 5, max: 6 },
    modules: [
      {
        id: "general",
        name: "General",
        description: "Vision y comunidad",
        recommended: true,
      },
      {
        id: "coaches",
        name: "Coaches",
        description: "Contratacion y estandares",
        recommended: true,
      },
      {
        id: "operaciones",
        name: "Operaciones",
        description: "Atencion y procesos",
        recommended: true,
      },
      {
        id: "ventas",
        name: "Ventas",
        description: "Planes y precios",
        recommended: true,
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Tono y contenidos",
        recommended: true,
      },
      {
        id: "legal",
        name: "Legal",
        description: "Terminos y privacidad",
        recommended: false,
      },
    ],
    starterKus: [
      {
        title: "Guia de tono de marca",
        domainName: "Marketing",
        content: `# Tono de marca

## Personalidad
Cercana, motivadora, inclusiva.

## Decimos
"Podes", "comunidad", "constancia".

## No decimos
Comparaciones negativas sobre el cuerpo ni promesas milagrosas.`,
      },
      {
        title: "Planes y precios",
        domainName: "Ventas",
        content: `# Planes

| Plan | Precio | Incluye |
|------|--------|---------|
| Free | $0 | Acceso basico |
| Pro | $... | Coach + ilimitado |

## Politica de cancelacion
...`,
      },
    ],
  },
];

export const GETTING_STARTED_STEPS = [
  {
    id: "domains",
    title: "Definir modulos (dominios)",
    description: "Areas de conocimiento de tu organizacion (3–6 es ideal).",
    href: "/settings",
    check: "hasDomains",
  },
  {
    id: "first_ku",
    title: "Crear la primera Knowledge Unit",
    description: "Una politica, proceso o idea versionada con responsable.",
    href: "/knowledge/new",
    check: "hasKus",
  },
  {
    id: "propose",
    title: "Proponer un cambio",
    description: 'Edita una KU y usa "Proponer cambio" (no sobrescribir).',
    href: "/knowledge",
    check: "hasProposed",
  },
  {
    id: "review",
    title: "Revisar y aprobar",
    description: "En Review Center: diff, contradicciones y aprobacion.",
    href: "/review",
    check: "hasApproved",
  },
  {
    id: "agent",
    title: "Compilar un agente",
    description: "Selecciona KUs aprobadas, prueba el chat y despliega.",
    href: "/agents",
    check: "hasAgent",
  },
  {
    id: "marketplace",
    title: "Explorar el marketplace",
    description: "Descubre agentes publicos o publica el tuyo.",
    href: "/marketplace",
    check: "optional",
  },
] as const;

export const GUIDE_INTRO = {
  name: "SOPH.IA",
  role: "Tu guia de conocimiento",
  message:
    "Te acompano a montar el sistema operativo de conocimiento de tu organizacion. No hace falta ser experto: elegi una plantilla, los modulos y damos el primer paso juntos.",
};