# API Documentation & Dataflows

**Objetivo:** Documentar todas las APIs, endpoints, flujos de datos y sincronizaciones.

**Stack:** Next.js 15 API Routes + Supabase + Neo4j

---

## 🏗️ Arquitectura de Datos

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                   │
│              src/app + src/components                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/Fetch
                     ▼
┌─────────────────────────────────────────────────────────┐
│              API Routes (Next.js 15)                     │
│          src/app/api/[route]/route.ts                    │
└────────────────┬────────────────────────────┬────────────┘
                 │                            │
                 ▼ (SQL)                      ▼ (Cypher)
        ┌──────────────────────┐     ┌──────────────────────┐
        │   PostgreSQL         │     │     Neo4j Aura       │
        │   (Supabase)         │     │   (Knowledge Graph)  │
        │                      │     │                      │
        │ - Users              │     │ - Knowledge Units    │
        │ - Organizations      │     │ - Dependencies       │
        │ - Permissions        │     │ - Relationships      │
        │ - Audit Logs         │     │                      │
        │ - Embeddings (pgvect)│     │                      │
        └──────────────────────┘     └──────────────────────┘
                 │                            │
                 └──────────┬─────────────────┘
                            │ Real-time (Supabase Realtime)
                            │ Webhooks, Events
                            ▼
                    ┌──────────────────┐
                    │   Event Bus      │
                    │  (Listeners)     │
                    └──────────────────┘
```

---

## 📡 API Endpoints

### Authentication

**POST** `/api/auth/login`
```json
Request:
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response (201):
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "organization_id": "org_456"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}

Errors:
- 400: Email/password inválido
- 429: Too many login attempts
```

**POST** `/api/auth/register`
```json
Request:
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "full_name": "John Doe",
  "organization_name": "My Org"
}

Response (201):
{
  "user": { ... },
  "organization": { ... },
  "session": { ... }
}

Validation:
- Email unique
- Password >= 8 chars
- Rate limit: 5 registrations per IP per hour
```

**POST** `/api/auth/logout`
```
Invalida la sesión del usuario
```

---

### Knowledge Units (KUs)

**GET** `/api/knowledge`
```
Listar Knowledge Units de la organización
Query params:
  - page: número de página (default: 1)
  - limit: items por página (default: 20, max: 100)
  - status: draft|proposed|approved|archived
  - domain: filtrar por dominio
  - search: búsqueda por título/contenido

Response:
{
  "data": [
    {
      "id": "ku_123",
      "title": "Política de privacidad",
      "domain": "Legal",
      "status": "approved",
      "trust_score": 95,
      "owner_id": "user_456",
      "created_at": "2026-08-01T10:00:00Z",
      "updated_at": "2026-08-03T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "has_next": true
  }
}
```

**POST** `/api/knowledge`
```
Crear una nueva Knowledge Unit
Body:
{
  "title": "Título",
  "content": "# Markdown content",
  "domain": "domain_id",
  "dependencies": ["ku_123", "ku_456"]
}

Response (201):
{
  "id": "ku_789",
  "hash": "abc123def456",
  "version": 1,
  "status": "draft",
  ...
}
```

**GET** `/api/knowledge/[kuId]`
```
Obtener una KU específica con historial
Response:
{
  "current": { ... },
  "history": [ ... ], // versiones anteriores
  "dependencies": [ ... ],
  "dependent_on": [ ... ]
}
```

**PUT** `/api/knowledge/[kuId]`
```
Proponer cambios (no sobrescribe)
Body:
{
  "title": "Nuevo título",
  "content": "Nuevo contenido",
  "reason": "Actualizar por cambio en policy"
}

Response:
{
  "id": "proposed_change_123",
  "status": "proposed",
  "proposed_by": "user_456",
  "created_at": "2026-08-04T10:00:00Z"
}
```

**DELETE** `/api/knowledge/[kuId]`
```
Archivar una KU (no eliminar)
Response (200): { success: true }
```

---

### Knowledge Graph

**GET** `/api/graph/nodes`
```
Obtener todos los nodos del grafo
Query params:
  - domain: filtrar por dominio
  - status: verde/amarillo/rojo

Response:
{
  "nodes": [
    {
      "id": "ku_123",
      "label": "Política X",
      "status": "verified", // verified|pending|requires_review
      "domain": "Legal",
      "x": 100,
      "y": 200
    }
  ]
}
```

**GET** `/api/graph/edges`
```
Obtener relaciones entre nodos
Response:
{
  "edges": [
    {
      "source": "ku_123",
      "target": "ku_456",
      "type": "depends_on|contradicts|complements",
      "weight": 0.8
    }
  ]
}
```

**POST** `/api/graph/search`
```
Búsqueda semántica en el grafo
Body:
{
  "query": "políticas de privacidad",
  "limit": 10
}

Response:
{
  "results": [
    {
      "id": "ku_123",
      "title": "...",
      "similarity_score": 0.95
    }
  ]
}
```

---

### Review Center

**GET** `/api/review/pending`
```
Cambios pendientes de aprobación
Query params:
  - owner_id: filtrar por propietario
  - domain: filtrar por dominio

Response:
{
  "pending": [
    {
      "id": "proposed_change_123",
      "ku_id": "ku_456",
      "proposed_by": "user_123",
      "status": "pending",
      "diff": {
        "old": "...",
        "new": "..."
      },
      "created_at": "2026-08-04T10:00:00Z"
    }
  ]
}
```

**POST** `/api/review/[changeId]/approve`
```
Aprobar un cambio
Body:
{
  "notes": "Cambio aprobado"
}

Response (200):
{
  "status": "approved",
  "approved_by": "user_456",
  "approved_at": "2026-08-04T11:00:00Z"
}
```

**POST** `/api/review/[changeId]/reject`
```
Rechazar un cambio
Body:
{
  "reason": "Necesita más contexto",
  "notes": "Sugerir redacción más clara"
}

Response (200):
{
  "status": "rejected",
  "rejected_by": "user_456"
}
```

---

### Agents

**GET** `/api/agents`
```
Listar agentes
Response:
{
  "agents": [
    {
      "id": "agent_123",
      "name": "Agent X",
      "description": "...",
      "domains": ["domain_1", "domain_2"],
      "status": "deployed|draft",
      "created_by": "user_123",
      "created_at": "2026-08-01T10:00:00Z",
      "last_compiled": "2026-08-04T10:00:00Z"
    }
  ]
}
```

**POST** `/api/agents`
```
Crear un nuevo agente
Body:
{
  "name": "Support Agent",
  "description": "Maneja tickets de soporte",
  "domains": ["domain_1", "domain_2"],
  "knowledge_units": ["ku_123", "ku_456"],
  "model": "claude-opus-5",
  "temperature": 0.7
}

Response (201):
{
  "id": "agent_123",
  "status": "draft",
  ...
}
```

**POST** `/api/agents/[agentId]/compile`
```
Compilar agente (generar contexto final)
Response (200):
{
  "agent_id": "agent_123",
  "context_size": 12000,
  "compiled_at": "2026-08-04T11:00:00Z",
  "preview": "# Context\n..."
}
```

**POST** `/api/agents/[agentId]/deploy`
```
Publicar agente en producción
Response (200):
{
  "deployment_id": "deploy_456",
  "status": "deployed",
  "endpoint": "https://api.soph.ia/agents/agent_123",
  "api_key": "sk_..."
}
```

---

## 🔄 Dataflows Principales

### 1. **Crear y Proponer un Cambio**

```
Usuario
  │
  ├─> Edit KU en /editor/[kuId]
  │
  ├─> Click "Proponer Cambio"
  │
  └─> POST /api/knowledge/[kuId]
        │ Validar contenido
        │ Generar embedding (pgvector)
        │ Crear proposed_change en DB
        │
        └─> Evento: KU_CHANGE_PROPOSED
              │
              ├─> Email a owner
              │
              └─> Notificación en Review Center
                    │
                    └─> Owner ve cambio en /review
```

### 2. **Aprobar/Rechazar Cambio**

```
Owner ve cambio en Review Center
  │
  ├─> Revisar Diff
  │
  ├─> [Si aprueba] POST /api/review/[changeId]/approve
  │   │
  │   ├─> Update KU version
  │   │
  │   ├─> Update Neo4j (graph)
  │   │
  │   ├─> Evento: KU_APPROVED
  │   │
  │   └─> Notificar a proposer
  │
  └─> [Si rechaza] POST /api/review/[changeId]/reject
      │
      └─> Evento: KU_REJECTED
            │
            └─> Notificar a proposer (con razón)
```

### 3. **Compilar Agente (Build)**

```
Usuario selecciona dominios/KUs
  │
  ├─> POST /api/agents/[agentId]/compile
  │   │
  │   ├─> Fetch todas las KUs aprobadas
  │   │
  │   ├─> Ordenar por dependencias (Neo4j)
  │   │
  │   ├─> Generar contexto en Markdown
  │   │
  │   ├─> Token counting (OpenAI)
  │   │
  │   ├─> Validar tamaño < max_context
  │   │
  │   └─> Guardar compilación en DB
  │
  └─> Response con preview
        │
        └─> Usuario ve contexto compilado
              │
              └─> [Opcional] Deploy
```

### 4. **Search Semántica**

```
Usuario busca en /graph
  │
  ├─> Input: "Política de privacidad"
  │
  ├─> POST /api/graph/search
  │   │
  │   ├─> Generar embedding del query
  │   │
  │   ├─> pgvector similarity search
  │   │
  │   ├─> Neo4j traverse relacionados
  │   │
  │   └─> Rank por relevancia + relaciones
  │
  └─> Mostrar resultados en grafo
```

### 5. **Real-time Colaboración**

```
Usuario A edita KU
  │
  ├─> PUT /api/knowledge/[kuId]
  │   │
  │   └─> Supabase Realtime evento
  │
  └─> Usuario B recibe actualización
        │
        ├─> WebSocket listener
        │
        └─> Refrescar vista en tiempo real
```

---

## 🔐 Seguridad en APIs

### Row Level Security (RLS)
```sql
-- Cada tabla tiene políticas RLS
-- Usuarios solo ven su organización

CREATE POLICY "Users see own organization data"
  ON knowledge_units
  FOR SELECT
  USING (organization_id = auth.uid()::organization_id);
```

### Rate Limiting
```
- Login: 5 intentos/15 min por IP
- API: 100 requests/min por usuario
- Large operations: 10 por hora
```

### CORS & CSRF
```typescript
// CORS configurado en next.config.ts
// CSRF tokens en cada form/API request

headers: {
  'X-CSRF-Token': csrfToken,
  'Content-Type': 'application/json'
}
```

### Authentication
```typescript
// Usar Supabase Auth
// JWT en Authorization header

Authorization: Bearer eyJ...
```

---

## 📊 Database Schema

### Knowledge Units Table
```sql
CREATE TABLE knowledge_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  domain_id UUID,
  owner_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  trust_score INT DEFAULT 0,
  embedding vector(1536), -- pgvector
  version INT DEFAULT 1,
  hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID,
  
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (domain_id) REFERENCES domains(id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_ku_org ON knowledge_units(organization_id);
CREATE INDEX idx_ku_domain ON knowledge_units(domain_id);
CREATE INDEX idx_ku_status ON knowledge_units(status);
CREATE INDEX idx_ku_embedding ON knowledge_units USING ivfflat (embedding vector_cosine_ops);
```

### Agents Table
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  model VARCHAR(100) DEFAULT 'claude-opus-5',
  temperature FLOAT DEFAULT 0.7,
  domains JSONB,
  knowledge_units JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_compiled TIMESTAMP,
  deployment_id UUID,
  
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 🔌 Webhooks & Events

### Events publicados
```
- KU_CREATED
- KU_UPDATED
- KU_CHANGE_PROPOSED
- KU_CHANGE_APPROVED
- KU_CHANGE_REJECTED
- AGENT_COMPILED
- AGENT_DEPLOYED
- USER_INVITED
- ORGANIZATION_CREATED
```

### Webhook example
```typescript
// Cliente subscripto
const unsubscribe = supabase
  .channel('knowledge_units')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'knowledge_units' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

---

## 🧪 Testing APIs

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Create KU
curl -X POST http://localhost:3000/api/knowledge \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"# Content","domain":"domain_id"}'

# Get graph
curl http://localhost:3000/api/graph/nodes \
  -H "Authorization: Bearer TOKEN"
```

---

## 📝 Error Handling

### Response Codes Estándar
```
200: OK
201: Created
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
409: Conflict
429: Too Many Requests
500: Internal Server Error
```

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is invalid",
    "details": {
      "field": "email",
      "rule": "email_format"
    }
  }
}
```

---

## 🚀 Performance Optimizations

- ✅ Pagination on large datasets
- ✅ Vector indexing (pgvector IVFFLAT)
- ✅ Database connection pooling
- ✅ Redis caching (próximo)
- ✅ GraphQL subscriptions (próximo)
- ✅ Worker threads para compilación de agentes

---

**Actualizado:** 2026-08-04
