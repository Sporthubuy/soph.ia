# SOPH.IA — Knowledge OS para Agentes de IA

## Descripción General

**SOPH.IA** es una plataforma colaborativa para construir y gestionar agentes de IA inteligentes y bases de conocimiento compartidas. Permite a equipos crear "Knowledge Units" (KUs) versionadas que actúan como memoria colectiva para sistemas de IA.

**Visión**: Convertir documentación dispersa en un Knowledge Graph interconectado, donde agentes pueden acceder a conocimiento estructurado y verificado.

**Usuarios finales**: Equipos técnicos, equipos de contenido, organizaciones que necesitan gobernanza de IA.

---

## Stack Tecnológico

```
Frontend:        Next.js 16 (App Router) + React 19 + Tailwind CSS 4
Backend:         Supabase (PostgreSQL + Auth + Realtime)
Storage:         Supabase Storage (archivos) + pgvector (embeddings)
Styling:         Tailwind CSS 4, next-themes (dark mode)
File Processing: mammoth (DOCX) + pdf-parse (PDF)
Icons:           Lucide React
Deployment:      Vercel
```

**Versiones clave**:
- `Next.js 16.3.0` — Últimas breaking changes en API, lee `node_modules/next/dist/docs/`
- `Tailwind CSS 4` — Nuevo @theme syntax, importa con `@import "tailwindcss"`
- `React 19` — Cambios en hooks, deprecaciones

---

## Estructura de Carpetas

```
soph.ia/
├── app/                         # Next.js App Router
│   ├── components/              # Componentes React reutilizables
│   │   ├── Header.tsx           # Header principal con tema
│   │   ├── Logo.tsx             # Logo de marca
│   │   ├── ThemeProvider.tsx    # Dark mode provider
│   │   └── ...
│   ├── lib/                     # Utilidades compartidas
│   │   ├── auth.ts              # Funciones: signUp, signIn, signOut, getCurrentUser
│   │   ├── email.ts             # SMTP config e inyección de templates
│   │   ├── embeddings.ts        # Generación de embeddings con pgvector
│   │   ├── file-extract.ts      # Extrae texto de PDFs y DOCs
│   │   ├── providers.ts         # Configuración de proveedores (email, embeddings)
│   │   ├── supabase/            # Clientes Supabase (server, client, admin)
│   │   ├── hooks/               # React hooks personalizados
│   │   └── ...
│   ├── api/                     # Rutas API (16 endpoints)
│   │   ├── agents/              # CRUD agentes
│   │   ├── knowledge-units/     # CRUD KUs, upload, embeddings
│   │   ├── auth/                # Signup, login, logout, password reset
│   │   ├── conversations/       # Chat + RAG con agentes
│   │   ├── search/              # Búsqueda global semantic + full-text
│   │   ├── invitations/         # Invitaciones de equipo
│   │   ├── notifications/       # Sistema de notificaciones
│   │   ├── profile/             # Perfil de usuario
│   │   ├── settings/            # Configuración de org (tema, email, etc.)
│   │   ├── keys/                # API keys personales
│   │   └── usage/               # Límites de uso
│   ├── agents/                  # Página de agentes
│   ├── dashboard/               # Dashboard principal
│   ├── knowledge-units/         # Gestión de Knowledge Units
│   ├── settings/                # Página de configuración
│   ├── auth/                    # Páginas de auth (login, signup, recovery)
│   ├── profile/                 # Perfil de usuario
│   ├── globals.css              # Design system: variables CSS, colores, dark mode
│   ├── layout.tsx               # Root layout con ThemeProvider
│   └── page.tsx                 # Home (landing o dashboard)
│
├── supabase/
│   └── migrations/              # Migraciones SQL con seed
│       ├── 20260808003927_create_waitlist_signups.sql
│       ├── 20260808141203_align_ku_statuses_and_types.sql
│       ├── 20260808154122_create_org_profiles_knowledge_units.sql
│       ├── 20260808183006_harden_profiles_knowledge_units_storage.sql
│       ├── 20260808200000_create_agents_and_settings.sql
│       ├── 20260808220000_email_configuration.sql
│       ├── 20260808230000_create_api_keys.sql
│       ├── 20260808240000_add_content_to_knowledge_units.sql
│       ├── 20260808250000_add_agent_options.sql
│       ├── 20260808260000_conversations_and_messages.sql
│       ├── 20260808270000_organization_invitations.sql
│       ├── 20260808280000_rag_embeddings.sql
│       └── 20260808290000_ku_visibility.sql
│
├── .claude/                     # Configuración de Claude Code
├── .codex/                      # Documentación generada
├── .agents/                     # Agentes personalizados
├── public/                      # Archivos estáticos (imágenes, logos)
└── package.json, tsconfig.json, tailwind.config.ts
```

---

## Design System — "Constellation"

Identidad gráfica basada en conceptos de **Knowledge Graph** (constelaciones de información interconectadas).

### Colores

**Modo Claro (por defecto)**:
- `--color-primary`: `#0F172A` (Slate-900)
- `--color-secondary`: `#3B82F6` (Blue-500)
- `--color-accent`: `#06B6D4` (Cyan-500)
- `--color-bg-primary`: `#FFFFFF`
- `--color-text-primary`: `#0F172A`

**Modo Oscuro** (recomendado, `data-theme="dark"`):
- `--color-primary`: `#5B9BFF` (Azure — identidad Sophia)
- `--color-secondary`: `#5B9BFF` (mismo)
- `--color-accent`: `#22D3EE` (Cyan-300)
- `--color-bg-primary`: `#0F172A` (Deep Navy)
- `--color-bg-secondary`: `#0B1120`
- `--color-text-primary`: `#F1F5F9` (Slate-100)

**Semánticos**:
- `--color-success`: `#10B981` (Green) / `#34D399` (Green-400 dark)
- `--color-warning`: `#F59E0B` (Amber) / `#FBBF24` (Amber-300 dark)
- `--color-error`: `#EF4444` (Red) / `#F87171` (Red-400 dark)
- `--color-submitted`: `#8B5CF6` (Purple) / `#A78BFA` (Purple-300 dark)

**Bordes y hover**:
- `--color-border`: `#E2E8F0` (light) / `#1E293B` (dark)
- `--color-hover`: `rgba(15, 23, 42, 0.05)` (light) / `rgba(91, 155, 255, 0.08)` (dark)
- `--color-active`: `rgba(15, 23, 42, 0.1)` (light) / `rgba(91, 155, 255, 0.15)` (dark)

### Tipografía

- **Font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Ubuntu"...`
- **Weight**: `700` (bold), `600` (semibold)
- **Líneas de componente**: 8px (xs), 12px (md), 16px (lg)

### Implementación

En `app/globals.css`:
```css
@import "tailwindcss";

@layer base {
  :root { /* Light theme */ }
  [data-theme="dark"] { /* Dark theme */ }
}
```

Usa `<ThemeProvider>` en `app/layout.tsx` para persistir tema en localStorage.

---

## Patrón de Autenticación

### Flujo

1. **Signup**: `signUpWithEmail(email, password, fullName)` → crea usuario Supabase Auth + perfil en tabla `profiles`
2. **Login**: `signInWithEmail(email, password)` → obtiene sesión + JWT
3. **Session**: Middleware de Next.js valida JWT en cookies (`@supabase/ssr`)
4. **Logout**: `signOut()` → destruye sesión

### Organización (Org-based)

- Todo usuario pertenece a **una organización** (creada al signup)
- **Patrón**: SIEMPRE usar `getCurrentOrganizationId()` para filtrar datos
  - ❌ NUNCA: `WHERE user_id = ...`
  - ✅ SIEMPRE: `WHERE organization_id = ... AND (user_id OR team_id)`

### Rutas Protegidas

Middleware valida token JWT:
```typescript
// app/api/knowledge-units/route.ts → requiere auth
const user = await getCurrentUser(supabase)
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

---

## Base de Datos — Schema Principal

### Tablas Críticas

**`profiles`**
- `id` (UUID, PK) — user_id de Auth
- `email` (text, unique)
- `full_name` (text)
- `initials` (text, auto-generated)
- `avatar_url` (text nullable)
- `theme` (text, default 'auto')

**`organizations`**
- `id` (UUID, PK)
- `owner_id` (FK → auth.users)
- `name` (text)
- `slug` (text, unique)
- `settings` (jsonb) — email SMTP config, etc.
- `created_at` (timestamp)

**`team_members`**
- `id` (UUID, PK)
- `organization_id` (FK)
- `user_id` (FK → auth.users)
- `role` ('owner', 'admin', 'member', 'viewer')
- `joined_at` (timestamp)

**`knowledge_units` (KUs)**
- `id` (UUID, PK)
- `organization_id` (FK)
- `title` (text)
- `description` (text)
- `content` (text) — markdown o HTML
- `type` ('article', 'faq', 'guide', 'api', 'code', 'custom')
- `status` ('draft', 'approved', 'published', 'archived')
- `version` (int, auto-incremented)
- `visibility` ('private', 'public', 'organization')
- `embedding` (vector(1536)) — pgvector para RAG
- `created_by` (FK → auth.users)
- `created_at`, `updated_at` (timestamp)

**`agents`**
- `id` (UUID, PK)
- `organization_id` (FK)
- `name` (text)
- `description` (text)
- `system_prompt` (text)
- `model` (text, e.g., 'claude-3-5-sonnet')
- `status` ('draft', 'active', 'inactive')
- `options` (jsonb) — temperatura, max_tokens, etc.
- `created_by` (FK)
- `created_at`, `updated_at` (timestamp)

**`conversations`**
- `id` (UUID, PK)
- `organization_id` (FK)
- `agent_id` (FK → agents)
- `user_id` (FK → auth.users)
- `title` (text)
- `created_at`, `updated_at` (timestamp)

**`messages`**
- `id` (UUID, PK)
- `conversation_id` (FK)
- `role` ('user', 'assistant')
- `content` (text)
- `created_at` (timestamp)

**`api_keys`**
- `id` (UUID, PK)
- `organization_id` (FK)
- `user_id` (FK)
- `key_hash` (text, hashed)
- `name` (text)
- `last_used_at` (timestamp nullable)
- `created_at` (timestamp)

**`organization_invitations`**
- `id` (UUID, PK)
- `organization_id` (FK)
- `email` (text)
- `role` ('admin', 'member', 'viewer')
- `token` (text, unique)
- `expires_at` (timestamp)
- `created_at` (timestamp)

---

## Seguridad y Visibilidad

### Modelo Visibility (Article 10 de Constitución)

Cada KU tiene `visibility`:
- `private` — solo el dueño
- `organization` — solo miembros del team
- `public` — internet (requiere validación de email)

**RLS (Row-Level Security)** enforce esto en BD:
```sql
-- knowledge_units: SELECT
CREATE POLICY "Users can view authorized KUs"
  ON knowledge_units FOR SELECT
  USING (
    visibility = 'public'
    OR (visibility = 'organization' AND organization_id = auth.uid()::org_id)
    OR (visibility = 'private' AND created_by = auth.uid())
  );
```

### Autenticación API

**Via JWT Bearer token** en headers:
```bash
curl -H "Authorization: Bearer sk_abc123..." https://api.soph.ia/api/agents
```

O **via API key hash** en tabla `api_keys` (future).

---

## API Endpoints (16 principales)

### Agentes

- `POST /api/agents` — Crear agente
- `GET /api/agents` — Listar agentes de org
- `GET /api/agents/:id` — Obtener detalles
- `PATCH /api/agents/:id` — Actualizar
- `DELETE /api/agents/:id` — Eliminar

### Knowledge Units

- `POST /api/knowledge-units` — Crear KU
- `GET /api/knowledge-units` — Listar (con filtros)
- `GET /api/knowledge-units/:id` — Obtener
- `PATCH /api/knowledge-units/:id` — Actualizar
- `DELETE /api/knowledge-units/:id` — Eliminar
- `POST /api/knowledge-units/:id/upload` — Upload PDF/DOCX (parsea contenido)
- `POST /api/knowledge-units/:id/embeddings` — Genera embeddings pgvector

### Conversations (RAG + Chat)

- `POST /api/conversations` — Crear conversación
- `GET /api/conversations` — Listar por usuario
- `POST /api/conversations/:id/messages` — Enviar mensaje (agente responde con RAG)

### Otros

- `GET /api/usage` — Límites de usuario (tokens, KUs, etc.)
- `GET /api/search` — Búsqueda global (full-text + semantic)
- `POST /api/notifications` — Sistema de notificaciones en tiempo real
- `POST /api/team` — Invitar miembros
- `GET /api/settings` — Obtener config org (tema, email, etc.)

---

## Flujos Principales

### 1. Crear y Publicar Knowledge Unit

1. Usuario sube PDF/DOCX → `/api/knowledge-units/upload`
2. Backend extrae texto (mammoth/pdf-parse) → guarda en `content`
3. Usuario edita + valida contenido
4. `/api/knowledge-units/:id/embeddings` genera vector + guarda en pgvector
5. KU pasa a `status='published'` → disponible en búsqueda RAG

### 2. Chat con Agente (RAG)

1. Usuario abre conversación → crea fila en `conversations`
2. Envía mensaje → `/api/conversations/:id/messages` (POST)
3. Backend:
   - Busca embeddings similares en pgvector (LIMIT 5)
   - Arma contexto con KUs más relevantes
   - Llama LLM con `system_prompt` del agente + contexto RAG
   - Persiste respuesta en `messages`
4. Frontend recibe y renderiza streaming

### 3. Invitar Miembro al Equipo

1. Owner/Admin envía email → POST `/api/team/invite`
2. Crea fila en `organization_invitations` con token temporal
3. Email enviado con link `?token=xyz`
4. Usuario acepta → verifica token + añade a `team_members`

---

## Desarrollo Local

### Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno (.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SMTP_HOST=...
SMTP_FROM=hola@sporthub.com.uy

# 3. Ejecutar migraciones (si es necesario)
supabase db push

# 4. Dev server
npm run dev
# Open http://localhost:3000
```

### Convenciones de Código

- **Componentes**: `PascalCase.tsx`, coloca en `app/components/`
- **Utilidades**: `camelCase.ts`, coloca en `app/lib/`
- **Rutas API**: `app/api/[feature]/route.ts`, sigue REST conventions
- **Variables CSS**: Todos los colores via `var(--color-*)`
- **Darkmode**: Envuelve con `[data-theme="dark"]`
- **Migraciones**: Timestamp + slug, e.g., `20260809000000_feature_description.sql`
- **Tipos**: Declara en mismo archivo o `app/lib/types.ts`

### Linting & Type Check

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

### Commits

Sigue convención:
```
feat(agents): agregar filtro por estado
fix(auth): resolver bug logout en dark mode
docs(CLAUDE): actualizar patrones de seguridad
refactor(api): simplificar middleware
```

---

## Recursos Útiles

- **DESIGN.md** — Detalles del Design System Constellation
- **node_modules/next/dist/docs/** — Guía oficial Next.js 16
- **Supabase Docs** — RLS, Auth, Real-time
- **pgvector Docs** — Embeddings y búsqueda semantic

---

## Estado Actual (2026-08-09)

- ✅ Auth completa (Supabase JWT)
- ✅ 16 endpoints API funcionales
- ✅ Design System Constellation implementado
- ✅ Dark mode con next-themes
- ✅ RLS en tablas críticas
- ✅ File parsing (PDF/DOCX)
- 🟡 RAG (embeddings + search) — 80% funcional
- 🟡 Notificaciones real-time — en progreso
- 🟡 Brand adaptation — 30% completo (Header, Logo en revisión)

---

**Última actualización**: 2026-08-09  
**Fundador**: Rodrigo González (@sporthubuy)  
**Email**: hola@sporthub.com.uy
