# Components Export - Código Reutilizable

**Objetivo:** Componentes React/TypeScript listos para copiar, pegar y usar.

**Convenciones:**
- ✅ TypeScript strict
- ✅ Sin dependencias externas (solo shadcn/ui)
- ✅ Server Components por defecto
- ✅ `"use client"` solo si es necesario
- ✅ Accesibilidad (WCAG AA)
- ✅ Responsive out-of-the-box

---

## 🔘 Button Component

**Ubicación:** `src/components/ui/button.tsx` (ya existe en shadcn/ui)

**Variantes disponibles:**
```tsx
// Primary (default)
<Button>Sign in</Button>

// Secondary
<Button variant="secondary">Cancelar</Button>

// Outline
<Button variant="outline">Rechazar</Button>

// Ghost (sin fondo)
<Button variant="ghost">Más opciones</Button>

// Destructive (rojo)
<Button variant="destructive">Eliminar</Button>

// Sizes
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>

// Disabled
<Button disabled>Deshabilitado</Button>

// Con loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Cargando...
</Button>
```

**Props:**
```tsx
interface ButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}
```

---

## 📝 Input Component

**Ubicación:** `src/components/ui/input.tsx`

**Uso básico:**
```tsx
'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación segura
    if (!email.includes('@')) {
      setError('Email inválido')
      return
    }
    
    // Submit
    console.log('Email:', email)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : undefined}
        />
        {error && (
          <p id="email-error" className="text-sm text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>
      <Button type="submit">Enviar</Button>
    </form>
  )
}
```

**Estados:**
```tsx
// Default
<Input placeholder="Escribe aquí..." />

// Con valor
<Input value="texto" readOnly />

// Error
<Input className="border-red-500" />

// Disabled
<Input disabled />

// Focus (automático con Tailwind)
<Input className="focus:ring-2 focus:ring-blue-500" />
```

---

## 🎴 Card Component

**Ubicación:** `src/components/ui/card.tsx`

**Estructura básica:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function FeatureCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Título de la tarjeta</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Contenido descriptivo aquí
        </p>
      </CardContent>
    </Card>
  )
}
```

**Variantes:**
```tsx
// Elevated (con sombra)
<Card className="shadow-lg">
  <CardContent>...</CardContent>
</Card>

// Outline (con borde)
<Card className="border-2">
  <CardContent>...</CardContent>
</Card>

// Clickeable
<Card className="cursor-pointer hover:shadow-lg transition-shadow">
  <CardContent>...</CardContent>
</Card>
```

---

## 🏷️ Badge Component

**Ubicación:** `src/components/ui/badge.tsx`

**Uso:**
```tsx
import { Badge } from '@/components/ui/badge'

export function StatusBadges() {
  return (
    <div className="space-x-2">
      {/* Variantes de color */}
      <Badge>Default</Badge>
      <Badge className="bg-green-500">Verificado</Badge>
      <Badge className="bg-yellow-500">Pendiente</Badge>
      <Badge className="bg-red-500">Error</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}
```

**Componente seguro:**
```tsx
interface StatusBadgeProps {
  status: 'verified' | 'pending' | 'error' | 'info'
  children: string
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const colorMap = {
    verified: 'bg-green-500/90 text-white',
    pending: 'bg-yellow-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-blue-500/90 text-white'
  }

  return (
    <Badge className={colorMap[status]}>
      {children}
    </Badge>
  )
}
```

---

## 🗂️ Modal/Dialog Component

**Ubicación:** `src/components/ui/dialog.tsx`

**Uso básico:**
```tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir Modal</Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar acción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>¿Estás seguro de que deseas continuar?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                console.log('Confirmado')
                setOpen(false)
              }}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

## 📋 Form Component Completo

**Componente seguro con validación:**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FormErrors {
  [key: string]: string
}

interface FormData {
  name: string
  email: string
  message: string
}

export function SecureForm() {
  const [data, setData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  // Validación segura
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar nombre (solo letras y espacios)
    if (!data.name || data.name.length < 2) {
      newErrors.name = 'Nombre requerido (mín 2 caracteres)'
    } else if (!/^[a-zA-Z\s]+$/.test(data.name)) {
      newErrors.name = 'Solo letras y espacios permitidos'
    }

    // Validar email
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email válido requerido'
    }

    // Validar mensaje
    if (!data.message || data.message.length < 10) {
      newErrors.message = 'Mensaje requerido (mín 10 caracteres)'
    } else if (data.message.length > 500) {
      newErrors.message = 'Mensaje muy largo (máx 500 caracteres)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      // Sanitizar datos antes de enviar
      const sanitizedData = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        message: data.message.trim()
      }

      // API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData)
      })

      if (!response.ok) throw new Error('Error al enviar')

      // Reset form
      setData({ name: '', email: '', message: '' })
      alert('Mensaje enviado exitosamente!')
    } catch (error) {
      console.error('Error:', error)
      setErrors({ form: 'Error al enviar el mensaje' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nombre
        </label>
        <Input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="Tu nombre"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-red-500 mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder="tu@email.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Mensaje
        </label>
        <textarea
          id="message"
          value={data.message}
          onChange={(e) => setData({ ...data, message: e.target.value })}
          placeholder="Tu mensaje aquí..."
          rows={4}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        <p className="text-xs text-gray-500 mt-1">
          {data.message.length}/500 caracteres
        </p>
        {errors.message && (
          <p id="message-error" className="text-sm text-red-500 mt-1">
            {errors.message}
          </p>
        )}
      </div>

      {/* Error general */}
      {errors.form && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {errors.form}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  )
}
```

---

## 🎯 Prácticas de Seguridad en Componentes

### 1. **Input Sanitization**
```tsx
// ❌ MALO - XSS vulnerable
<div>{userInput}</div>

// ✅ BUENO - React escapa automáticamente
<div>{userInput}</div>

// ✅ MEJOR - Validar antes
const sanitizedInput = userInput.trim().substring(0, 100)
<div>{sanitizedInput}</div>
```

### 2. **Validación de Props**
```tsx
interface ComponentProps {
  id: string // nunca un number o cualquier cosa
  label: string
  onClick?: () => void
  className?: string
}

export function SafeComponent({ id, label, onClick, className }: ComponentProps) {
  // Validar id format
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    console.error('Invalid id format')
    return null
  }

  return (
    <button 
      id={id} 
      onClick={onClick} 
      className={`default-classes ${className || ''}`}
    >
      {label}
    </button>
  )
}
```

### 3. **Prevenir XSS en URLs**
```tsx
// ❌ MALO
<a href={userProvidedUrl}>Link</a>

// ✅ BUENO
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

<a href={isValidUrl(userProvidedUrl) ? userProvidedUrl : '#'}>
  Link
</a>
```

### 4. **API Call Security**
```tsx
// ✅ BUENO - CSRF token + validación
const handleSubmit = async (data: FormData) => {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken // desde el servidor
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```

---

## 📦 Checklist de Importación

Cuando copies un componente, asegúrate de:

- [ ] Importar dependencias correctas
- [ ] Revisar TypeScript types
- [ ] Validar props en el componente
- [ ] Verificar accessibility attributes (aria-*)
- [ ] Testear en dark/light mode
- [ ] Testear en mobile (responsive)
- [ ] Revisar seguridad (XSS, CSRF)
- [ ] Documentar props en JSDoc

---

## 🔗 Referencias

- **shadcn/ui:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **OWASP:** https://owasp.org/www-project-web-security-testing-guide/
- **React Docs:** https://react.dev/
