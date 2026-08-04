# SOPH.IA UI Reference for Figma

**Objetivo:** Documento de referencia para llevar toda la UI desarrollada a Figma y crear variantes/mejoras.

**Fecha:** 2026-08-04  
**Versión:** 1.0  
**Design System:** Constellation (Dark/Light mode)

---

## 📋 Pantallas Públicas (Sin Autenticación)

### 1. Landing Page (`/en`)
**Estado:** Completado  
**Componentes:**
- Header con Logo, Navegación (Producto, Features, Especificaciones) y CTAs
- Hero Section con título principal y descripción
- Features Grid (3+ columnas)
- Footer con links organizados

**Colores:**
- Fondo primario: #0F1419 (Dark)
- Acento primario: #5B9BFF (Azul)
- Texto secundario: #9CA3AF

**Tipografía:**
- Títulos: Hanken Grotesk
- Body: JetBrains Mono

---

### 2. Login Page (`/en/login`)
**Estado:** Completado  
**Componentes:**
- Logo centrado
- Título "Welcome back"
- Formulario de login (Email, Password)
- Botón primario "Sign in" (azul)
- Link "Forgot?" para resetear contraseña
- Link "Create one" para registro

**Layout:** Centrado, Card oscuro

---

### 3. Register Page (`/en/register`)
**Estado:** Completado  
**Componentes:**
- Logo centrado
- Título "Create account"
- Formulario (Full Name, Email, Password)
- Validaciones inline (Min 6 characters)
- Botón primario "Create account"
- Link "Sign in" para usuarios existentes

**Layout:** Centrado, Card oscuro

---

### 4. Forgot Password (`/en/forgot-password`)
**Estado:** Completado  
**Componentes:**
- Formulario de recuperación (Email)
- Botón de envío

---

### 5. Reset Password (`/en/reset-password`)
**Estado:** Completado  
**Componentes:**
- Formulario de reset (Nueva contraseña)
- Validaciones

---

## 🔐 Pantallas Autenticadas (Requiere Login)

### Dashboard Principal (`/[locale]/(dashboard)`)
**Componentes esperados:**
- Sidebar navegable (Graph, Knowledge, Agents, Review, Projects, Settings)
- Header con user profile, notificaciones
- Main content area por sección
- Dark mode por defecto

**Secciones:**
1. **Knowledge Graph** (`/[locale]/(dashboard)/graph`)
   - Vista de grafo con nodos interactivos
   - Nodos de colores: Verde (verificado), Amarillo (pendiente), Rojo (requiere revisión)
   - Controles de zoom, filtros, búsqueda
   - Panel lateral con detalles del nodo

2. **Editor de Knowledge Units** (`/[locale]/(dashboard)/knowledge/[kuId]/edit`)
   - Editor Markdown con preview lado a lado
   - Toolbar de formato (Bold, Italic, Headers, etc.)
   - Botón "Proponer Cambio"
   - Panel de dependencias
   - Trust Score indicator

3. **Review Center** (`/[locale]/(dashboard)/review`)
   - Lista de cambios pendientes
   - Vista Diff (líneas verdes/rojas)
   - Botones Aprobar/Rechazar
   - Alertas de contradicciones

4. **Agent Compiler** (`/[locale]/(dashboard)/agents`)
   - Dashboard de agentes
   - "Build Agent" modal
   - Selector de dominios/nodos
   - Preview del contexto compilado
   - Botón Deploy

5. **Projects** (`/[locale]/(dashboard)/projects`)
   - Lista de proyectos
   - Cards con metadatos
   - Acciones rápidas

6. **Settings** (`/[locale]/(dashboard)/settings`)
   - Formularios de configuración
   - Preferencias de organización
   - Permisos y roles

---

### Admin Panel (`/admin`)
**Componentes:**
- Admin Sidebar (Agents, Users, Knowledge, Analytics, Audit Logs, Settings)
- Tablas de datos
- Filtros y búsqueda
- Acciones bulk
- Modals para CRUD

---

## 🎨 Componentes Core (shadcn/ui)

### Botones
- **Primary:** Azul (#5B9BFF), texto blanco
- **Secondary:** Outline, gris
- **Destructive:** Rojo para acciones peligrosas
- **Ghost:** Sin fondo
- **Sizes:** sm, md, lg

Ejemplo: "Sign in", "Proponer Cambio", "Aprobar", "Deploy"

### Inputs
- **Text Input:** Dark bg, border gris
- **Variants:** default, error (border rojo)
- **Placeholder:** Gris claro
- **Focus state:** Outline azul

### Cards
- **Elevated:** Con sombra suave
- **Outline:** Border gris suave
- **Dark bg:** #1A1F2E o similar

### Badges/Status
- Verde: Verificado/Aprobado
- Amarillo: Pendiente/En revisión
- Rojo: Requiere atención/Error
- Azul: Info

### Navigation
- Sidebar con items activos/inactivos
- Indicador visual de página actual
- Iconos + texto
- Colapsable en mobile

### Tablas
- Headers fijos
- Rows alternadas (ligeramente diferentes bg)
- Hover state
- Sorting indicators
- Pagination

---

## 🎯 Design System Constellation

### Colores Principales
```
Primario: #5B9BFF (Azul)
Secundario: #8B5CF6 (Púrpura)
Éxito: #10B981 (Verde)
Advertencia: #F59E0B (Amarillo)
Error: #EF4444 (Rojo)
```

### Fondos
```
Dark: #0F1419
Dark Secondary: #1A1F2E
Light: #FFFFFF
Light Secondary: #F3F4F6
```

### Texto
```
Dark Mode:
  - Primario: #FFFFFF
  - Secundario: #D1D5DB
  - Terciario: #9CA3AF

Light Mode:
  - Primario: #1F2937
  - Secundario: #6B7280
  - Terciario: #9CA3AF
```

### Sombras
```
Suave: 0 2px 8px rgba(0,0,0,0.1)
Media: 0 4px 16px rgba(0,0,0,0.2)
Fuerte: 0 8px 32px rgba(0,0,0,0.3)
```

### Espaciado
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Bordes
```
Radio: 6px (componentes), 8px (cards), 12px (modals)
Grosor: 1px (outline), 2px (focus)
```

### Tipografía
```
Títulos: Hanken Grotesk
- H1: 48px, 700
- H2: 36px, 700
- H3: 24px, 600
- H4: 20px, 600

Body: JetBrains Mono
- Regular: 16px, 400
- Small: 14px, 400
- Tiny: 12px, 400

Monospace: JetBrains Mono
```

---

## 📱 Breakpoints

```
Mobile: 320px - 640px
Tablet: 640px - 1024px
Desktop: 1024px+
```

---

## 🔄 Estados de Componentes

### Botones
- Default (reposo)
- Hover (color más oscuro)
- Active/Pressed
- Disabled (opacidad 50%)
- Loading (spinner)

### Inputs
- Default
- Focus (outline azul)
- Filled
- Disabled
- Error (border rojo, mensaje)
- Success (border verde)

### Cards
- Default
- Hover (sombra aumentada)
- Selected (border azul)
- Disabled

### Nav Items
- Default
- Hover (bg suave)
- Active (bg + acento)
- Disabled

---

## 🌓 Dark/Light Mode

**Implementación:** CSS variables + next-themes  
**Storage:** localStorage  
**Toggle:** Header (moon/sun icon)

### Variables CSS (Constellation)
```css
--color-primary: #5B9BFF
--color-bg: #0F1419 (dark) / #FFFFFF (light)
--color-text: #FFFFFF (dark) / #1F2937 (light)
--color-border: #374151 (dark) / #E5E7EB (light)
```

---

## 📦 Componentes a Recrear en Figma

1. **Button** (5 variantes × 3 tamaños = 15 versiones)
2. **Input** (3 estados × 2 variantes = 6 versiones)
3. **Card** (2 variantes)
4. **Badge** (5 colores)
5. **Nav Item** (4 estados)
6. **Table Cell** (3 tipos)
7. **Modal** (base + variantes)
8. **Dropdown** (open/closed)
9. **Toggle/Switch**
10. **Checkbox/Radio**
11. **Textarea**
12. **Select**
13. **Tooltip**
14. **Toast/Alert**
15. **Pagination**

---

## 🚀 Próximos Pasos para Figma

1. **Crear Main Component Library**
   - Organizar por categoría (Form, Navigation, Data, etc.)
   - Usar Figma variants para estados
   - Establecer naming convention clara

2. **Crear Pantallas Full**
   - Landing page completa
   - Login/Register
   - Dashboard layout
   - Cada sección del dashboard

3. **Prototiping**
   - Navegación entre pantallas
   - Micro-interactions
   - Estado hover/active

4. **Iteración de Mejoras**
   - Análisis de UX
   - Variantes de diseño
   - Testing de accesibilidad

---

## 📝 Notas

- **Constellation Design System v1.0** está implementado en código (globals.css, DESIGN.md)
- **Modo oscuro por defecto** en dashboard (preferencia del usuario)
- **Iconos personalizados** (drawn, no system icons)
- **Próximas fases:** Marketplace, Analytics avanzado, Integraciones
