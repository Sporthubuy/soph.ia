# SOPH.IA - The Knowledge Operating System for AI

## Proyecto

SOPH.IA es una plataforma colaborativa donde las organizaciones construyen, versionan y gobiernan su conocimiento colectivo para alimentar agentes de IA. No es un chatbot ni un wrapper de LLM: es la infraestructura donde el conocimiento humano se estructura, evoluciona y se compila en inteligencia artificial.

**Analogia clave:** GitHub administra codigo. SOPH.IA administra conocimiento.

## Arquitectura del Sistema

### Conceptos Core

- **Knowledge Unit (KU):** Unidad minima de conocimiento (una idea, politica, regla o dato) encapsulada y versionada. Contiene: ID+Hash, Domain, Owner, Content (Markdown), Vector Embedding, Dependencies y Trust Score (0-100).
- **Knowledge Graph:** Mapa visual de nodos interconectados que representa todo el conocimiento de la organizacion.
- **Version Control Engine:** Sistema tipo Git para conocimiento. Cada edicion crea un estado inmutable con rollback instantaneo.
- **Agent Compiler:** Compila los nodos activos en su ultima version aprobada para generar/actualizar el contexto de un agente de IA.
- **Model Router:** Capa agnostica de inferencia (OpenAI, Anthropic, Llama, etc.) para evitar vendor lock-in.

### Triple Base de Datos

| Capa | Tecnologia | Proposito |
|------|-----------|-----------|
| Relacional | PostgreSQL (Supabase) | Usuarios, permisos, logs, metadata, audit trail |
| Grafos | Neo4j | Relaciones entre KUs, dependencias, arbol organizacional |
| Vectorial | pgvector (Supabase) | Embeddings para busqueda semantica y alimentar LLMs |

### Stack Tecnologico

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **UI Components:** shadcn/ui + Tailwind CSS 4
- **Visualizacion de Grafos:** React Flow / D3.js
- **Backend/API:** Next.js API Routes + Supabase Edge Functions
- **Auth:** Supabase Auth (email, OAuth, RBAC)
- **Base de datos relacional:** Supabase (PostgreSQL)
- **Base de datos vectorial:** pgvector via Supabase
- **Base de datos de grafos:** Neo4j Aura (cloud)
- **Real-time:** Supabase Realtime (colaboracion en vivo)
- **Storage:** Supabase Storage (archivos adjuntos a KUs)
- **AI/LLM:** Anthropic Claude API (primario), OpenAI (secundario) via Model Router
- **Deployment:** Vercel (frontend) + Supabase (backend)
- **Testing:** Vitest + Playwright
- **Monorepo:** Turborepo (cuando se agreguen mas packages)

## Estructura del Proyecto

```
soph.ia/
├── CLAUDE.md
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env.local                    # Variables de entorno (nunca commitear)
├── supabase/
│   ├── config.toml
│   ├── migrations/               # Migraciones SQL
│   └── functions/                # Edge Functions
├── src/
│   ├── app/                      # App Router (Next.js)
│   │   ├── (auth)/               # Rutas de autenticacion
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # Layout principal autenticado
│   │   │   ├── graph/            # Knowledge Graph (vista de pajaro)
│   │   │   ├── editor/           # Editor de Knowledge Units
│   │   │   ├── review/           # Review Center (gobernanza)
│   │   │   ├── agents/           # Agent Compiler
│   │   │   └── settings/         # Configuracion de organizacion
│   │   ├── api/                  # API Routes
│   │   │   ├── knowledge/        # CRUD de KUs
│   │   │   ├── graph/            # Operaciones del grafo
│   │   │   ├── agents/           # Compilacion de agentes
│   │   │   └── ai/               # Model Router endpoints
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── graph/                # Componentes del Knowledge Graph
│   │   ├── editor/               # Componentes del editor de KUs
│   │   ├── review/               # Componentes del Review Center
│   │   └── shared/               # Componentes compartidos
│   ├── lib/
│   │   ├── supabase/             # Cliente y tipos de Supabase
│   │   ├── neo4j/                # Cliente de Neo4j
│   │   ├── ai/                   # Model Router y utilidades de IA
│   │   ├── knowledge/            # Logica de negocio de KUs
│   │   └── utils/                # Utilidades generales
│   ├── hooks/                    # React hooks custom
│   └── types/                    # TypeScript types e interfaces
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                         # Documentacion tecnica interna
```

## Vistas Principales de la UI

1. **Knowledge Graph** (`/graph`): Mapa visual de nodos con colores de estado (verde=verificado, amarillo=pendiente, rojo=requiere revision). Zoom, filtros por dominio, busqueda.
2. **Editor de Nodos** (`/editor/[kuId]`): Editor Markdown con preview. Boton "Proponer Cambio" (no "Guardar"). Muestra dependencias y Trust Score.
3. **Review Center** (`/review`): Lista de cambios pendientes con vista Diff (agregado/eliminado). Alertas de contradicciones entre areas. Aprobacion/rechazo por owners.
4. **Agent Compiler** (`/agents`): Dashboard de agentes. "Build Agent" seleccionando dominios/nodos. Preview del contexto compilado. Deploy y monitoreo.

## Modelo de Datos Core

### Knowledge Unit (KU)
```typescript
interface KnowledgeUnit {
  id: string;                    // ej: "ku_8f92a"
  hash: string;                  // hash criptografico de la version
  version: number;               // autoincremental
  domain: string;                // rama del arbol organizacional
  ownerId: string;               // usuario responsable
  organizationId: string;
  title: string;
  content: string;               // Markdown
  embedding: number[];           // vector embedding
  trustScore: number;            // 0-100
  status: 'draft' | 'proposed' | 'approved' | 'archived';
  dependencies: string[];        // IDs de KUs relacionadas
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
}
```

### Organizacion y Permisos
```typescript
interface Organization {
  id: string;
  name: string;
  slug: string;
  domains: Domain[];             // arbol de dominios
}

interface Domain {
  id: string;
  name: string;                  // ej: "Marketing", "Ventas", "Legal"
  parentId: string | null;       // para sub-dominios
  ownerId: string;               // lider del dominio
}
```

## Constitucion (Principios de Diseno)

Estos 10 articulos son intransables y deben guiar toda decision de diseno:

1. El conocimiento es el producto. Nunca los prompts, modelos o chats.
2. La colaboracion siempre tiene prioridad sobre la automatizacion.
3. Todo conocimiento tiene un responsable (nunca conocimiento huerfano).
4. Todo conocimiento tiene historia (nunca sobrescribir, siempre versionar).
5. Todo conocimiento puede reutilizarse (no escribir dos veces).
6. La IA propone. Las personas aprueban.
7. La confianza es mas importante que la velocidad.
8. La simplicidad gana (si el usuario necesita un curso, nos equivocamos).
9. Nunca quedar atados a un proveedor de IA.
10. El conocimiento pertenece a quien lo crea. SOPH.IA facilita, no se apropia.

## Convenciones de Codigo

- TypeScript estricto (`strict: true`). No usar `any`.
- Componentes React como funciones con arrow functions.
- Nombres de archivos en kebab-case. Componentes en PascalCase.
- Server Components por defecto. `"use client"` solo cuando sea necesario.
- Imports absolutos con alias `@/` apuntando a `src/`.
- Supabase: usar el cliente de servidor en Server Components y Route Handlers. Cliente de browser solo en Client Components.
- Variables de entorno prefijadas con `NEXT_PUBLIC_` solo para las que necesiten estar en el browser.
- Migraciones SQL en `supabase/migrations/` con timestamps.
- Row Level Security (RLS) obligatorio en todas las tablas.

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de produccion
npm run lint         # Linting
npm run test         # Tests unitarios
npm run test:e2e     # Tests end-to-end
npm run db:migrate   # Correr migraciones de Supabase
npm run db:reset     # Reset de base de datos local
npm run db:types     # Generar tipos de TypeScript desde Supabase
```

## Variables de Entorno Requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```
