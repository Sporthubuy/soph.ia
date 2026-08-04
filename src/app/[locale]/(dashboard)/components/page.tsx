'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Component Showcase / Storybook
 *
 * Esta es una página para testear y demostrar todos los componentes
 * en diferentes variantes y estados.
 *
 * Acceder a: /[locale]/(dashboard)/components
 */

interface ComponentStory {
  name: string
  description: string
  variants: {
    label: string
    component: React.ReactElement
  }[]
}

export default function ComponentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('buttons')

  const stories: Record<string, ComponentStory> = {
    buttons: {
      name: 'Buttons',
      description: 'Todos los tipos y estados de botones',
      variants: [
        {
          label: 'Primary Default',
          component: <Button>Sign in</Button>
        },
        {
          label: 'Primary Hover',
          component: <Button className="hover:opacity-90">Hover me</Button>
        },
        {
          label: 'Primary Disabled',
          component: <Button disabled>Disabled</Button>
        },
        {
          label: 'Secondary',
          component: <Button variant="secondary">Secondary</Button>
        },
        {
          label: 'Outline',
          component: <Button variant="outline">Outline</Button>
        },
        {
          label: 'Ghost',
          component: <Button variant="ghost">Ghost</Button>
        },
        {
          label: 'Destructive',
          component: <Button variant="destructive">Delete</Button>
        },
        {
          label: 'Size SM',
          component: <Button size="sm">Small</Button>
        },
        {
          label: 'Size LG',
          component: <Button size="lg">Large</Button>
        }
      ]
    },
    inputs: {
      name: 'Inputs',
      description: 'Campos de entrada en diferentes estados',
      variants: [
        {
          label: 'Default',
          component: <Input placeholder="Escribe aquí..." />
        },
        {
          label: 'Con valor',
          component: <Input value="Texto ingresado" readOnly />
        },
        {
          label: 'Disabled',
          component: <Input disabled placeholder="Deshabilitado" />
        },
        {
          label: 'Con error',
          component: (
            <div>
              <Input className="border-red-500" placeholder="Email inválido" />
              <p className="text-sm text-red-500 mt-1">Email no es válido</p>
            </div>
          )
        },
        {
          label: 'Email type',
          component: <Input type="email" placeholder="tu@email.com" />
        },
        {
          label: 'Password type',
          component: <Input type="password" placeholder="Contraseña" />
        }
      ]
    },
    badges: {
      name: 'Badges',
      description: 'Indicadores de estado y etiquetas',
      variants: [
        {
          label: 'Default',
          component: <Badge>Default</Badge>
        },
        {
          label: 'Success',
          component: <Badge className="bg-green-500/90">Verificado</Badge>
        },
        {
          label: 'Warning',
          component: <Badge className="bg-yellow-500/90">Pendiente</Badge>
        },
        {
          label: 'Error',
          component: <Badge className="bg-red-500/90">Error</Badge>
        },
        {
          label: 'Info',
          component: <Badge className="bg-blue-500/90">Info</Badge>
        },
        {
          label: 'Outline',
          component: <Badge variant="outline">Outline</Badge>
        }
      ]
    },
    cards: {
      name: 'Cards',
      description: 'Contenedores de contenido',
      variants: [
        {
          label: 'Default Card',
          component: (
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Título de tarjeta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Esta es una tarjeta con contenido descriptivo.
                </p>
              </CardContent>
            </Card>
          )
        },
        {
          label: 'Elevated Card',
          component: (
            <Card className="w-full max-w-sm shadow-lg">
              <CardHeader>
                <CardTitle>Tarjeta elevada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Con sombra más pronunciada.
                </p>
              </CardContent>
            </Card>
          )
        },
        {
          label: 'Hoverable Card',
          component: (
            <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Tarjeta interactiva</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hover para ver el efecto.
                </p>
              </CardContent>
            </Card>
          )
        }
      ]
    },
    forms: {
      name: 'Forms',
      description: 'Ejemplos de formularios completos',
      variants: [
        {
          label: 'Login Form',
          component: <LoginFormDemo />
        },
        {
          label: 'Feedback Form',
          component: <FeedbackFormDemo />
        }
      ]
    }
  }

  const categories = Object.keys(stories)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Component Showcase</h1>
          <p className="text-muted-foreground">
            Testing ground para todos los componentes de SOPH.IA
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              size="sm"
            >
              {stories[cat].name}
            </Button>
          ))}
        </div>

        {/* Content */}
        {selectedCategory && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {stories[selectedCategory].name}
              </h2>
              <p className="text-muted-foreground mb-6">
                {stories[selectedCategory].description}
              </p>
            </div>

            {/* Grid de componentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories[selectedCategory].variants.map((variant, idx) => (
                <Card key={idx} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {variant.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center min-h-[120px] bg-muted/50 rounded">
                    {variant.component}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Guía de Uso</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <GuidelineForCategory category={selectedCategory} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Demo: Login Form
 */
function LoginFormDemo() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    if (!email) {
      newErrors.email = 'Email requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    if (!password) {
      newErrors.password = 'Contraseña requerida'
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      alert('Formulario válido. En producción se enviaría al servidor.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="login-email" className="text-sm font-medium block mb-1">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="text-sm font-medium block mb-1">
          Contraseña
        </label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  )
}

/**
 * Demo: Feedback Form
 */
function FeedbackFormDemo() {
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedback.trim().length > 10) {
      setSubmitted(true)
      setFeedback('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="feedback" className="text-sm font-medium block mb-1">
          Tu feedback
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Cuéntanos qué te parece..."
          rows={3}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {submitted && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          ✓ Gracias por tu feedback!
        </div>
      )}

      <Button type="submit" disabled={feedback.trim().length < 10}>
        Enviar feedback
      </Button>
    </form>
  )
}

/**
 * Directrices según categoría
 */
function GuidelineForCategory({ category }: { category: string }) {
  const guidelines: Record<string, React.ReactElement> = {
    buttons: (
      <div>
        <h4>Cuándo usar cada variante:</h4>
        <ul>
          <li><strong>Primary:</strong> Acción principal/CTA</li>
          <li><strong>Secondary:</strong> Acciones secundarias</li>
          <li><strong>Outline:</strong> Acciones terciarias</li>
          <li><strong>Ghost:</strong> Acciones mínimas</li>
          <li><strong>Destructive:</strong> Acciones peligrosas (delete, etc)</li>
        </ul>
        <h4 className="mt-4">Tamaños:</h4>
        <ul>
          <li><strong>sm:</strong> Acciones en línea</li>
          <li><strong>md:</strong> Por defecto</li>
          <li><strong>lg:</strong> Botones principales</li>
        </ul>
      </div>
    ),
    inputs: (
      <div>
        <h4>Atributos importantes:</h4>
        <ul>
          <li>Siempre usar <code>type</code> apropiado (email, password, etc)</li>
          <li>Validar en cliente y servidor</li>
          <li>Mostrar errores debajo del input</li>
          <li>aria-invalid para accesibilidad</li>
        </ul>
        <h4 className="mt-4">Estados:</h4>
        <ul>
          <li>Focus: border azul + sombra</li>
          <li>Error: border rojo + mensaje</li>
          <li>Disabled: opacidad reducida</li>
        </ul>
      </div>
    ),
    badges: (
      <div>
        <h4>Significados de colores:</h4>
        <ul>
          <li><strong>Verde:</strong> Verificado/Aprobado/Éxito</li>
          <li><strong>Amarillo:</strong> Pendiente/En progreso</li>
          <li><strong>Rojo:</strong> Error/Requiere acción</li>
          <li><strong>Azul:</strong> Info/Neutral</li>
        </ul>
        <h4 className="mt-4">Uso:</h4>
        <p>Para indicar estado de items en listas, tags de categoría, etc.</p>
      </div>
    ),
    cards: (
      <div>
        <h4>Casos de uso:</h4>
        <ul>
          <li>Agrupar contenido relacionado</li>
          <li>Separar secciones visualmente</li>
          <li>Crear elementos clickeables</li>
        </ul>
        <h4 className="mt-4">Variantes:</h4>
        <ul>
          <li><strong>Default:</strong> Contenido estático</li>
          <li><strong>Elevated:</strong> Destacar/Promover</li>
          <li><strong>Hoverable:</strong> Elementos interactivos</li>
        </ul>
      </div>
    ),
    forms: (
      <div>
        <h4>Mejores prácticas:</h4>
        <ul>
          <li>Validar en cliente antes de enviar</li>
          <li>Mostrar errores específicos</li>
          <li>Deshabilitar submit si hay errores</li>
          <li>Sanitizar datos antes de enviar</li>
          <li>Mostrar estado de carga</li>
          <li>Confirmación después de submit</li>
        </ul>
      </div>
    )
  }

  return guidelines[category] || <p>No hay guidelines para esta categoría</p>
}
