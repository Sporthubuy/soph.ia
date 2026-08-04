# Testing Guide - SOPH.IA

**Objetivo:** Asegurar calidad y confiabilidad mediante testing automatizado.

**Stack:** Vitest (unit) + Playwright (E2E)

---

## 🧪 Quick Start

```bash
# Unit tests
npm run test              # Ejecutar tests una vez
npm run test:watch       # Watch mode (rerun on changes)
npm run test:ui          # UI mode (dashboard interactivo)
npm run test:coverage    # Generar coverage report

# E2E tests
npm run test:e2e         # Ejecutar todos los E2E tests
npm run test:e2e:ui      # UI mode (interactive)
npm run test:e2e:debug   # Debug mode (inspector abierto)
npm run test:e2e:headed  # Mostrar navegador durante tests
```

---

## 📁 Estructura de Tests

```
tests/
├── setup.ts                          # Setup global (jsdom, mocks)
├── unit/                             # Unit tests (Vitest)
│   ├── components/
│   │   ├── button.test.tsx
│   │   ├── input.test.tsx
│   │   └── ...
│   └── utils/
│       ├── validation.test.ts
│       ├── security.test.ts
│       └── ...
└── e2e/                              # E2E tests (Playwright)
    ├── auth.spec.ts
    ├── home.spec.ts
    ├── dashboard.spec.ts
    └── ...
```

---

## 🔧 Configuración

### Vitest (vitest.config.ts)
```typescript
- environment: jsdom      # Para componentes React
- coverage: 80% threshold # Mínimo aceptable
- globals: true           # describe, it, expect sin imports
```

### Playwright (playwright.config.ts)
```typescript
- browsers: chromium, firefox, webkit
- devices: Desktop + Mobile
- baseURL: http://localhost:3000
- webServer: Inicia dev server automáticamente
```

---

## ✍️ Escribir Unit Tests

### Patrón básico
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('debe renderizar correctamente', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })

  it('debe manejar interacciones', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(screen.getByText('After click')).toBeInTheDocument()
  })
})
```

### Testing Library Best Practices

```typescript
// ✅ BUENO - Query por role/label (como usuario)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByPlaceholderText(/search/i)

// ❌ MALO - Query por test ID (si se puede evitar)
screen.getByTestId('my-button')

// ❌ PEOR - Query directa al DOM
wrapper.querySelector('.my-button')
```

### Validar Seguridad

```typescript
it('debe sanitizar input contra XSS', () => {
  render(<Input value="<script>alert('xss')</script>" />)
  
  // React escapa automáticamente
  expect(screen.queryByText('script')).not.toBeInTheDocument()
})

it('debe validar email antes de enviar', async () => {
  const user = userEvent.setup()
  const handleSubmit = vi.fn()
  
  render(<LoginForm onSubmit={handleSubmit} />)
  
  const emailInput = screen.getByLabel(/email/i)
  await user.type(emailInput, 'invalid-email')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  // No debería enviar con email inválido
  expect(handleSubmit).not.toHaveBeenCalled()
})
```

---

## ✍️ Escribir E2E Tests

### Patrón básico
```typescript
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('debe completar user flow completo', async ({ page }) => {
    // Navegar
    await page.goto('/feature')
    
    // Interactuar
    await page.getByLabel(/input/i).fill('value')
    await page.getByRole('button', { name: /submit/i }).click()
    
    // Verificar resultado
    await expect(page.getByText(/success/i)).toBeVisible()
  })
})
```

### Queries Principales

```typescript
// Por role (recomendado)
page.getByRole('button', { name: /click/i })
page.getByRole('link', { name: /home/i })
page.getByRole('textbox')

// Por label
page.getByLabel(/email/i)

// Por placeholder
page.getByPlaceholder(/search/i)

// Por texto
page.getByText(/welcome/i)

// Por test ID (si es necesario)
page.getByTestId('my-button')

// Locator genérico
page.locator('div.my-class')
```

### Esperas Inteligentes

```typescript
// ✅ BUENO - Esperar a elemento
await expect(page.getByText(/success/i)).toBeVisible()

// ✅ BUENO - Esperar a URL
await expect(page).toHaveURL(/\/dashboard/)

// ❌ MALO - Sleep fijo (no confiable)
await page.waitForTimeout(1000)

// ✅ BUENO - Esperar a elemento específico
await page.waitForSelector('.my-element', { timeout: 5000 })
```

### Testing de Accessibility

```typescript
test('debe ser accesible por keyboard', async ({ page }) => {
  await page.goto('/my-form')
  
  // Navegar con Tab
  await page.keyboard.press('Tab')
  const focused1 = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  expect(focused1).toBeDefined()
  
  await page.keyboard.press('Tab')
  const focused2 = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  expect(focused2).toBeDefined()
})

test('debe tener labels asociados', async ({ page }) => {
  const inputs = page.locator('input')
  
  for (let i = 0; i < await inputs.count(); i++) {
    const input = inputs.nth(i)
    const label = await input.getAttribute('aria-label')
    
    expect(label || await input.getAttribute('id')).toBeTruthy()
  }
})
```

---

## 📊 Coverage Reports

Después de correr tests:

```bash
npm run test:coverage
```

Genera reporte en `coverage/index.html`:
```
├── Lines: % de líneas cubiertas
├── Functions: % de funciones cubiertas
├── Branches: % de condicionales cubiertos
└── Statements: % de statements cubiertos
```

**Target:** > 80% en todos

---

## 🚨 Debugging Tests

### Vitest Debug
```bash
npm run test:debug
# Luego: node --inspect-brk ./node_modules/vitest/vitest.mjs --run
```

### Playwright Debug
```bash
npm run test:e2e:debug

# O en test:
test.only('my test', async ({ page }) => {
  await page.pause()  // Pausa la ejecución
  // ...
})
```

---

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:coverage
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

---

## 📋 Test Checklist

Antes de mergear cambios:

- [ ] Todos los tests pasan (`npm run test`)
- [ ] Coverage > 80% (`npm run test:coverage`)
- [ ] E2E tests pasan (`npm run test:e2e`)
- [ ] Accesibilidad validada (Playwright)
- [ ] Security validada (sanitización, validación)
- [ ] Performance OK (< 3s en E2E)

---

## 🎯 Testing Strategy por Feature

### Componentes UI
```
- Unit test: Rendering + Props + States
- Unit test: Interacciones (click, type)
- Unit test: Accessibility (keyboard, labels)
- E2E test: En contexto real (opcional para triviales)
```

### APIs/Routes
```
- Unit test: Validación de input
- Unit test: Sanitización
- Integration test: DB operations
- E2E test: Full request/response cycle
```

### Forms
```
- Unit test: Validación de fields
- Unit test: Error messages
- Unit test: Submit behavior
- E2E test: Full user journey (llenar + submit)
```

### Authentication
```
- Unit test: Password validation
- E2E test: Login flow completo
- E2E test: Register flow completo
- E2E test: Logout
- E2E test: Protected routes
```

---

## 📚 Recursos

- **Vitest:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/
- **Playwright:** https://playwright.dev/
- **Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

**Última actualización:** 2026-08-04
