# SOPH.IA — Diseño del Sistema (Constellation)

**Última actualización:** 2026-08-03  
**Versión:** 1.0 Oficial  
**Fuente:** SOPH.IA_Brand_Guide_Oficial

---

## 🎨 Paleta de Colores Oficial

### Primarios (Azure Accent)
```css
--azure: #5B9BFF;           /* Azul primario - Acciones, enlaces, focos */
--azure-bright: #82B4FF;    /* Azul claro - Estados hover/active */
--azure-deep: #3F7FE0;      /* Azul profundo - Estados presionados */
```

### Fondos (Sky - Paleta Oscura)
```css
--sky-0: #080B12;    /* Más oscuro - Canvas alternativo */
--sky-1: #0A0E17;    /* Canvas principal */
--sky-2: #0F1420;    /* Superficies - Cards, panels */
--sky-3: #151B2B;    /* Raised - Inputs, hover */
--sky-4: #1B2233;    /* Higher - Popovers, modals */
```

### Textos (Star - Claros)
```css
--star-1: #E8EDF7;   /* Primario - Headings, énfasis */
--star-2: #B8C1D4;   /* Body - Texto regular */
--star-3: #8B95AB;   /* Muted - Hints, metadata */
--star-4: #5B6478;   /* Disabled - Texto deshabilitado */
```

### Estados Semánticos
```css
--verified: #34D399;  /* Verde - Aprobado/Verificado */
--pending: #FBBF24;   /* Amarillo - Pendiente/Revisar */
--danger: #FB6A68;    /* Rojo - Error/Riesgo */
--archived: #5B6478;  /* Gris - Inactivo/Archivado */
--draft: #93A4C4;     /* Gris-Azul - Borrador */
```

### Bordes
```css
--edge: #212A3E;          /* Hairline - Bordes sutiles */
--edge-strong: #2E3950;   /* Strong - Énfasis, hover */
```

---

## 📝 Tipografía

### Fuentes
- **Display/Headings:** Inter (weights: 300, 400, 500, 600)
- **Body:** Inter (weights: 400, 600)
- **Data/Mono:** JetBrains Mono (weight: 400)

### Escala Headline
- `headline-xl`: 48px / Light (300) / tracking -1px
- `headline-lg`: 36px / Regular (400) / tracking -0.5px
- `headline-md`: 28px / Medium (500) / tracking -0.3px

### Escala Body
- `body-lg`: 18px / Regular / line-height 1.7
- `body-md`: 16px / Regular / line-height 1.6
- `body-sm`: 14px / Regular / line-height 1.6

### Utilidades
- `label`: 12px / Semibold / uppercase
- `caption`: 11px / Regular / muted
- `mono`: 13px / Regular / JetBrains Mono

---

## 🎯 Componentes

### Botones Primary
- Background: #5B9BFF (Azure)
- Text: White
- Padding: 12px 28px
- Border Radius: 6px
- Hover: #82B4FF + shadow
- Active: #3F7FE0 + scale(0.98)

### Botones Secondary
- Background: Transparent
- Border: 1.5px solid #2E3950
- Text: #E8EDF7
- Hover: Border/Text → #5B9BFF

### Cards
- Background: #0F1420 (Sky-2)
- Border: 1px solid #212A3E
- Border Radius: 12px
- Padding: 24px

### Inputs
- Background: #151B2B (Sky-3)
- Border: 1px solid #212A3E
- Border Radius: 8px
- Focus: Border #5B9BFF + shadow

### Badges
- Verified: #34D399 (White text)
- Pending: #FBBF24 (#1a1a1a text)
- Draft: #93A4C4 (White text)
- Archived: #5B6478 (White text)

---

## 📐 Espaciado
- XS: 4px | SM: 8px | MD: 16px | LG: 24px | XL: 32px | 2XL: 48px

---

## ✨ Animaciones
- Duration: 300ms ease-out (default)
- Fast: 150ms | Slow: 500ms

---

## ♿ Accesibilidad (WCAG AA)
- Text contrast: 4.5:1 minimum
- Focus ring: 2px solid Azure
- Star-1 on Sky-1: 19.5:1 ✓

---

**SOPH.IA — The Knowledge Operating System**
