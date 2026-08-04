# Security Guidelines - SOPH.IA

**Objetivo:** Asegurar que todos los componentes, APIs y datos están protegidos contra vulnerabilidades comunes.

**Estándar:** OWASP Top 10 + CWE Top 25

---

## 🛡️ 1. Input Validation & Sanitization

### Validación en Cliente

```typescript
// ❌ MALO - No valida
const handleInput = (value: string) => {
  setData(value)
}

// ✅ BUENO - Valida tipo y formato
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const handleEmailInput = (value: string) => {
  if (validateEmail(value)) {
    setEmail(value)
  } else {
    setError('Email inválido')
  }
}

// ✅ MEJOR - Validación robusta
interface ValidationRule {
  type: 'email' | 'url' | 'phone' | 'text' | 'number'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  required?: boolean
}

function validateInput(value: string, rule: ValidationRule): boolean {
  if (rule.required && !value) return false
  if (rule.minLength && value.length < rule.minLength) return false
  if (rule.maxLength && value.length > rule.maxLength) return false
  if (rule.pattern && !rule.pattern.test(value)) return false
  
  if (rule.type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
  if (rule.type === 'url') {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }
  
  return true
}
```

### Sanitización en Servidor

```typescript
// Next.js API Route
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    // 1. Parse y validar JSON
    let body
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400 }
      )
    }

    // 2. Validar estructura
    const { email, name, message } = body
    
    if (typeof email !== 'string' || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid types' }),
        { status: 400 }
      )
    }

    // 3. Sanitizar (trim, lowercase, truncate)
    const sanitized = {
      email: email.toLowerCase().trim().substring(0, 255),
      name: name.trim().substring(0, 100),
      message: message?.trim().substring(0, 5000) || ''
    }

    // 4. Validar en servidor (CRÍTICO!)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email' }),
        { status: 400 }
      )
    }

    if (sanitized.name.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Name too short' }),
        { status: 400 }
      )
    }

    // 5. Insert en DB (Supabase)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('submissions')
      .insert([sanitized])

    if (error) {
      console.error('DB Error:', error)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: data[0].id }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}
```

---

## 🔐 2. Cross-Site Scripting (XSS) Prevention

### ❌ VULNERABLE
```tsx
// XSS vulnerability - userInput puede contener JavaScript
<div>{userInput}</div>
<div dangerouslySetInnerHTML={{ __html: userInput }} />
<img src={userUrl} />
<a href={userUrl}>Link</a>
```

### ✅ SAFE
```tsx
// React escapa automáticamente
<div>{userInput}</div>

// Para HTML, usar librería segura
import DOMPurify from 'dompurify'

<div>{DOMPurify.sanitize(html)}</div>

// Para URLs, validar protocolo
const isSafeUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

<a href={isSafeUrl(userUrl) ? userUrl : '#'}>Link</a>

// Para imágenes
<img 
  src={isSafeUrl(userUrl) ? userUrl : '/placeholder.png'}
  onError={(e) => {
    // Fallback si imagen no carga
    e.currentTarget.src = '/placeholder.png'
  }}
/>
```

---

## 🔒 3. Authentication & Authorization

### JWT & Session Management
```typescript
// Usar Supabase Auth (recomendado)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Verificar sesión
const { data: { session } } = await supabase.auth.getSession()

// Server-side (usar Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // NEVER expose this
)
```

### CSRF Protection
```typescript
// 1. Generar token en servidor
import crypto from 'crypto'

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// 2. Validar en formularios
'use client'

export function ContactForm() {
  const [csrfToken, setCSRFToken] = useState('')

  useEffect(() => {
    // Fetch token del servidor
    fetch('/api/csrf-token')
      .then(r => r.json())
      .then(d => setCSRFToken(d.token))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken // incluir en header
      },
      body: JSON.stringify(formData)
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// 3. Validar en servidor
export async function POST(req: Request) {
  const csrfToken = req.headers.get('X-CSRF-Token')
  const sessionToken = req.cookies.get('session')?.value

  // Validar que token es válido
  if (!isValidCSRFToken(csrfToken, sessionToken)) {
    return new Response('CSRF token invalid', { status: 403 })
  }

  // Procesar request
}
```

---

## 🚫 4. SQL Injection Prevention

### ❌ VULNERABLE
```typescript
// SQL injection - NUNCA hacer esto
const query = `SELECT * FROM users WHERE email = '${email}'`
db.execute(query)
```

### ✅ SAFE
```typescript
// Usar prepared statements / parameterized queries
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(...)

// Supabase escapa automáticamente
const { data, error } = await supabase
  .from('users')
  .select()
  .eq('email', email) // parámetro seguro

// Si usas SQL directo
const { data, error } = await supabase.rpc('stored_procedure', {
  email_param: email // parámetro nombrado
})
```

---

## 🔗 5. CORS & Middleware Security

### Configuración segura de CORS
```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization,X-CSRF-Token'
          }
        ]
      }
    ]
  }
}

export default nextConfig
```

### Rate Limiting
```typescript
// Middleware para rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  
  try {
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return new Response('Too many requests', { status: 429 })
    }
  } catch (error) {
    // Redis unavailable, allow request but log
    console.error('Rate limit check failed:', error)
  }

  // Process request
}
```

---

## 🔐 6. Environment Variables & Secrets

### ❌ MALO
```typescript
// Nunca expongas secrets en el código
const API_KEY = 'sk_live_abc123xyz'

// Nunca commitees .env
// Nunca uses secrets en client-side code
```

### ✅ BUENO
```typescript
// .env.local (NUNCA commitear)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

SUPABASE_SERVICE_ROLE_KEY=eyJ... # servidor solo
ANTHROPIC_API_KEY=sk_... # servidor solo
DATABASE_URL=postgresql://... # servidor solo

// En código - solo en servidor
export async function handleRequest() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  // usar en servidor, nunca expongas al cliente
}

// Client-safe variables - siempre prefijo NEXT_PUBLIC_
export function ClientComponent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // seguro exponerlo en cliente
}
```

### .env.local Template
```
# Guardar como .env.example en el repo
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=

ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 🔍 7. Data Privacy & GDPR

### Row-Level Security (RLS)
```sql
-- CRÍTICO: Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios ven solo su organización
CREATE POLICY "Users see own organization"
  ON knowledge_units
  FOR SELECT
  USING (organization_id = auth.user_id()::organization_id);

-- Política: Admins pueden ver todo
CREATE POLICY "Admins see all"
  ON knowledge_units
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### Data Deletion & GDPR
```typescript
// Función para eliminar datos de usuario (derecho al olvido)
export async function deleteUserData(userId: string) {
  const supabase = createClient(...)

  try {
    // 1. Eliminar sesiones
    await supabase.auth.admin.deleteUser(userId)

    // 2. Eliminar datos personales
    await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    // 3. Anonimizar datos relacionados
    await supabase
      .from('submissions')
      .update({ user_id: null })
      .eq('user_id', userId)

    // 4. Log para auditoría
    await supabase
      .from('audit_logs')
      .insert({
        action: 'USER_DELETED',
        user_id: userId,
        timestamp: new Date()
      })
  } catch (error) {
    console.error('Error deleting user data:', error)
    throw error
  }
}
```

---

## 🧪 8. Security Checklist

### Antes de Deploy
- [ ] Validar TODAS las entradas (cliente + servidor)
- [ ] Sanitizar HTML/URLs
- [ ] Implementar CSRF tokens
- [ ] Rate limiting en APIs públicas
- [ ] CORS configurado correctamente
- [ ] RLS habilitado en BD
- [ ] Secrets en .env (no en código)
- [ ] Logs de seguridad configurados
- [ ] HTTPS forzado
- [ ] Dependencias actualizadas (`npm audit fix`)

### En Producción
- [ ] Monitoreo de seguridad activo
- [ ] Logs centralizados (Sentry, LogRocket)
- [ ] Alertas para actividades sospechosas
- [ ] Backups automáticos
- [ ] Plan de incident response
- [ ] Auditoría periódica

---

## 🐛 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad, **NO** la publiques públicamente.

Contactar a: **security@soph.ia**

Incluir:
- Descripción de la vulnerabilidad
- Pasos para reproducir
- Impacto potencial
- Solución sugerida (si tienes)

---

## 📚 Referencias

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE Top 25: https://cwe.mitre.org/top25/
- GDPR: https://gdpr-info.eu/
- Supabase Security: https://supabase.com/docs/guides/realtime/security
- Next.js Security: https://nextjs.org/docs/guides/security

---

**Última actualización:** 2026-08-04
