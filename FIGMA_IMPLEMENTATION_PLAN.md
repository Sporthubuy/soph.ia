# Plan de Implementación: Llevar UI a Figma

**Objetivo:** Crear una biblioteca completa en Figma de todos los componentes y pantallas de SOPH.IA.

**Estado:** 🟡 Ready for Figma  
**Prioridad:** Alta  
**Inicio:** 2026-08-04

---

## 📊 Fases de Implementación

### FASE 1: Setup y Estructura (Dia 1)

**Acciones:**
- [ ] Crear nuevo file en Figma: "SOPH.IA Design System"
- [ ] Configurar páginas:
  - [ ] _Setup (estilos, componentes base)
  - [ ] 00_Colors
  - [ ] 01_Typography
  - [ ] 02_Spacing & Layout
  - [ ] 03_Components
  - [ ] 04_Screens
  - [ ] 05_Prototypes

- [ ] Crear **Color Styles** (16 total):
  ```
  Colors/Primary: #5B9BFF
  Colors/Secondary: #8B5CF6
  Colors/Success: #10B981
  Colors/Warning: #F59E0B
  Colors/Error: #EF4444
  Colors/Dark-BG: #0F1419
  Colors/Dark-BG-Secondary: #1A1F2E
  Colors/Light-BG: #FFFFFF
  Colors/Light-BG-Secondary: #F3F4F6
  Colors/Dark-Text: #FFFFFF
  Colors/Dark-Text-Secondary: #D1D5DB
  Colors/Dark-Text-Tertiary: #9CA3AF
  Colors/Light-Text: #1F2937
  Colors/Light-Text-Secondary: #6B7280
  Colors/Light-Text-Tertiary: #9CA3AF
  Colors/Border-Dark: #374151
  Colors/Border-Light: #E5E7EB
  ```

- [ ] Crear **Typography Styles**:
  ```
  H1: Hanken Grotesk, 48px, 700
  H2: Hanken Grotesk, 36px, 700
  H3: Hanken Grotesk, 24px, 600
  H4: Hanken Grotesk, 20px, 600
  Body-Regular: JetBrains Mono, 16px, 400
  Body-Small: JetBrains Mono, 14px, 400
  Body-Tiny: JetBrains Mono, 12px, 400
  Mono: JetBrains Mono, 14px, 400
  ```

- [ ] Crear **Grid System**:
  ```
  Breakpoints:
  - Mobile: 320px - 640px
  - Tablet: 640px - 1024px
  - Desktop: 1024px+
  
  Spacing Scale:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  ```

---

### FASE 2: Componentes Base (Día 2-3)

**Acciones - Button Component:**
- [ ] Crear Main Component "Button"
- [ ] 5 Variants: Primary, Secondary, Outline, Ghost, Destructive
- [ ] 3 Sizes: sm (32px), md (40px), lg (48px)
- [ ] 4 States: Default, Hover, Active, Disabled
  - Default: bg-primary, text-white
  - Hover: bg-primary-dark (opacity 90%)
  - Active: bg-primary-dark (opacity 100%)
  - Disabled: opacity 50%

**Acciones - Input Components:**
- [ ] Crear "TextInput" component
- [ ] States: Default, Focus, Filled, Error, Disabled
- [ ] Padding: 12px 16px
- [ ] Border-radius: 6px
- [ ] Focus state: border-color #5B9BFF, shadow

- [ ] Crear "Textarea" component
- [ ] Crear "Select" component
- [ ] Crear "Checkbox" component
- [ ] Crear "Radio" component
- [ ] Crear "Toggle/Switch" component

**Acciones - Card Components:**
- [ ] Crear "Card" component
- [ ] 2 Variants: Elevated (con sombra), Outline (con border)
- [ ] Padding: 24px
- [ ] Border-radius: 8px
- [ ] Background: Color-BG-Secondary

**Acciones - Navigation:**
- [ ] Crear "NavItem" component
- [ ] States: Default, Hover, Active, Disabled
- [ ] Active state: bg suave + acento primario izquierdo

**Acciones - Data Display:**
- [ ] Crear "Badge" component (5 colores)
- [ ] Crear "StatusIndicator" (Verde, Amarillo, Rojo)
- [ ] Crear "TableCell" component (3 tipos: Header, Data, Action)
- [ ] Crear "Pagination" component

**Acciones - Feedback:**
- [ ] Crear "Toast/Alert" component (4 tipos: Info, Success, Warning, Error)
- [ ] Crear "Tooltip" component
- [ ] Crear "Modal" component (base + variantes)
- [ ] Crear "Loading Spinner"
- [ ] Crear "Skeleton Loader"

---

### FASE 3: Pantallas (Día 4-5)

**Acciones - Pantallas Públicas:**
- [ ] Landing Page
  - [ ] Header + Navigation
  - [ ] Hero Section
  - [ ] Features Grid (3 columnas)
  - [ ] Footer
  - [ ] Dark + Light modes

- [ ] Login Page
  - [ ] Card centrado
  - [ ] Formulario (Email, Password)
  - [ ] "Sign in" button
  - [ ] Links (Forgot, Create account)

- [ ] Register Page
  - [ ] Card centrado
  - [ ] Formulario (Full Name, Email, Password)
  - [ ] Validaciones inline
  - [ ] "Create account" button

- [ ] Forgot Password
- [ ] Reset Password
- [ ] Privacy/Terms/Status páginas

**Acciones - Dashboard Screens:**
- [ ] Dashboard Layout (Sidebar + Main)
  - [ ] Sidebar (8 items de navegación)
  - [ ] Header (Logo, Profile, Notifications)
  - [ ] Breadcrumb navigation

- [ ] Knowledge Graph Page
  - [ ] Grafo con nodos (verde, amarillo, rojo)
  - [ ] Controles (zoom, filtros)
  - [ ] Panel lateral de detalles
  - [ ] Search bar

- [ ] Editor Page
  - [ ] Split view (Markdown + Preview)
  - [ ] Toolbar de formato
  - [ ] Sidebar de dependencias
  - [ ] Trust Score indicator
  - [ ] "Proponer Cambio" button

- [ ] Review Center
  - [ ] Lista de cambios pendientes
  - [ ] Diff viewer
  - [ ] Approve/Reject buttons
  - [ ] Alerts panel

- [ ] Agents Dashboard
  - [ ] Agentes list/grid
  - [ ] "Build Agent" modal
  - [ ] Deploy controls
  - [ ] Stats cards

- [ ] Projects Page
  - [ ] Projects grid
  - [ ] Project cards con metadata
  - [ ] Quick actions

- [ ] Settings Page
  - [ ] Tabs (Organization, Members, Billing)
  - [ ] Formularios con validación

**Acciones - Admin Panel:**
- [ ] Admin Layout
- [ ] Users Table
- [ ] Agents Table
- [ ] Knowledge Table
- [ ] Analytics Dashboard
- [ ] Audit Logs

---

### FASE 4: Interacciones y Prototyping (Día 6)

**Acciones:**
- [ ] Conectar navegación (home → login → dashboard)
- [ ] Modal interactions (open/close)
- [ ] Dropdown/Menu interactions
- [ ] Tab switching
- [ ] State transitions (hover → active)

---

### FASE 5: Mejoras y Variantes (Día 7+)

**Acciones:**
- [ ] Explorar variantes de diseño
- [ ] Micro-interactions (loading, transitions)
- [ ] Temas alternativos
- [ ] Mobile responsive layouts
- [ ] Accessibility improvements

---

## 📋 Checklist de Componentes

### Esenciales (MUST HAVE)
- [ ] Button (todas las variantes y tamaños)
- [ ] Input/Textarea
- [ ] Card
- [ ] Navigation (Sidebar, Header)
- [ ] Badge/Status
- [ ] Modal
- [ ] Table
- [ ] Form validation states

### Importantes (SHOULD HAVE)
- [ ] Dropdown
- [ ] Tooltip
- [ ] Toast
- [ ] Pagination
- [ ] Tabs
- [ ] Checkbox/Radio
- [ ] Select
- [ ] Toggle

### Nice to Have (COULD HAVE)
- [ ] Skeleton loaders
- [ ] Spinners
- [ ] Progress bar
- [ ] Slider
- [ ] Calendar picker
- [ ] Date picker
- [ ] Avatars
- [ ] Badges con icono

---

## 🎨 Especificaciones de Diseño

### Botones
```
Primary Button (Default):
- Background: #5B9BFF
- Text: #FFFFFF
- Padding: 12px 24px
- Border-radius: 6px
- Font: 16px, 600
- Height: 40px (md)

Hover:
- Background: #4A8BE6 (10% darker)
- Shadow: 0 4px 12px rgba(91, 155, 255, 0.3)

Active:
- Background: #3A7BCC (20% darker)

Disabled:
- Opacity: 50%
- Cursor: not-allowed
```

### Inputs
```
TextInput:
- Background: #1A1F2E (dark) / #FFFFFF (light)
- Border: 1px #374151 (dark) / #E5E7EB (light)
- Padding: 12px 16px
- Border-radius: 6px
- Font: 14px
- Height: 40px

Focus State:
- Border-color: #5B9BFF
- Box-shadow: 0 0 0 3px rgba(91, 155, 255, 0.1)

Error State:
- Border-color: #EF4444
- Error text: 12px, #EF4444
- Margin-top: 4px
```

### Cards
```
Card:
- Background: #1A1F2E (dark) / #FFFFFF (light)
- Border-radius: 8px
- Padding: 24px
- Border: 1px #374151 (dark) / #E5E7EB (light) [outline variant]
- Shadow: 0 2px 8px rgba(0,0,0,0.1) [elevated variant]

Hover:
- Shadow increased
- Cursor: pointer (if clickable)
```

### Spacing
```
Componente a componente: md (16px)
Contenedor padding: lg (24px)
Secciones: xl (32px)
Page padding: lg-xl (24-32px)
```

---

## 🔄 Workflow Recomendado

1. **Crear componentes base** con variantes en Figma
2. **Establecer naming convention**:
   ```
   Component/Element-Name
   Component/Element-Name-Variant
   Component/Element-Name-Variant-State
   
   Ejemplo:
   Button/Primary-md
   Button/Primary-md-Hover
   Button/Secondary-lg-Disabled
   ```

3. **Usar Figma Tokens** para colores y tipografía
4. **Organizar en pages** por categoría
5. **Crear library compartible** para equipo
6. **Versionar** cambios significativos

---

## ✨ Variantes y Mejoras a Considerar

- [ ] Animaciones suaves en transiciones
- [ ] Micro-interactions (ripple effect, scale)
- [ ] Loading states más visuales
- [ ] Empty states
- [ ] Error states con iconografía
- [ ] Success confirmations
- [ ] Guided tours (onboarding)
- [ ] Tooltips contextuales
- [ ] Accessibility improvements (focus rings, contrast checks)

---

## 📞 Recursos

- **FIGMA_UI_REFERENCE.md** - Documento de referencia completa
- **globals.css** - Valores de diseño en código
- **DESIGN.md** - Especificaciones del Design System
- **http://localhost:3000** - App en vivo para referencia

---

## 🚀 Siguiente Paso

Una vez completes FASE 1 (Setup), todos los componentes y pantallas pueden crearse en paralelo. 

**Recomendación:** Empezar con componentes base (Button, Input, Card) para establecer el patrón, luego escalar a pantallas completas.

---

**Creado por:** Claude + Rodrigo  
**Actualizado:** 2026-08-04
