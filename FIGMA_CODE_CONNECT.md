# Figma Code Connect - SOPH.IA

**Objetivo:** Sincronizar componentes React con Figma automáticamente.

---

## 📁 Estructura

```
src/figma/
├── Button.figma.ts      # Button component template
├── Input.figma.ts       # Input component template
├── Card.figma.ts        # Card component template
├── Badge.figma.ts       # Badge component template
└── Dialog.figma.ts      # Dialog component template

figma.config.json        # Figma configuration
```

---

## 🚀 Cómo Usar

### Step 1: Crear componentes en Figma
1. Abre el archivo Figma: https://figma.com/design/yfxASgccpiepeijz9AjGQf/Soph.ia
2. Crea componentes principales (Button, Input, Card, Badge, Dialog)
3. Configura variantes:
   - **Button:** variant (default, outline, secondary, ghost, destructive, link) + size (xs, sm, default, lg)
   - **Input:** type (text, email, password, etc) + states (default, error, disabled)
   - **Card:** variant (elevated, outline) + title (string property)
   - **Badge:** status (default, success, pending, error, info) + variant (default, outline)
   - **Dialog:** type (alert, confirmation, action, info) + title (string property)

### Step 2: Publish componentes
En Figma, publica los componentes a tu team library:
1. Right-click componente → "Publish to Library"
2. O usa Assets panel → "Publish"

### Step 3: Install Code Connect CLI
```bash
npm install -D @figma/code-connect
```

### Step 4: Authenticate
```bash
npx figma-code connect auth
# Abre navegador, completa OAuth con tu cuenta Figma
```

### Step 5: Publish templates
```bash
npx figma-code connect publish
# Publica los templates (.figma.ts) a Figma
```

---

## 📝 Template Structure

Cada `.figma.ts` tiene:

```typescript
// url=...               // Figma file URL
// source=...            // Ruta al componente React
// component=...         // Nombre del componente
import figma from 'figma'

const instance = figma.selectedInstance

// Extraer propiedades de Figma
const prop1 = instance.getString('PropertyName')
const prop2 = instance.getEnum('PropertyName', { 'FigmaVal': 'codeVal' })
const prop3 = instance.getBoolean('PropertyName')
const slot = instance.getSlot('SlotName')

export default {
  example: figma.code`<Component prop="${prop}" />`,
  imports: ['import { Component } from "path"'],
  id: 'unique-id',
  metadata: { nestable: true, props: { prop1, prop2 } }
}
```

---

## 🔄 Property Types

| Figma Type | Method | Use Case |
|---|---|---|
| TEXT | `getString('Name')` | Labels, placeholders |
| BOOLEAN | `getBoolean('Name')` | Disabled, error states |
| VARIANT | `getEnum('Name', {...})` | Size, variant options |
| INSTANCE_SWAP | `getInstanceSwap('Name')` | Swappable icons/components |
| SLOT | `getSlot('Name')` | Content regions |

---

## ✅ Included Templates

### Button.figma.ts
- Mapea: variant, size, disabled, label
- Importa desde: `@/components/ui/button`

### Input.figma.ts
- Mapea: type, placeholder, value, disabled, error
- Importa desde: `@/components/ui/input`

### Card.figma.ts
- Mapea: variant, title, content (slot)
- Importa desde: `@/components/ui/card`

### Badge.figma.ts
- Mapea: status, variant, label
- Importa desde: `@/components/ui/badge`

### Dialog.figma.ts
- Mapea: type, title, content (slot), actions (slot)
- Importa desde: `@/components/ui/dialog`

---

## 🔧 Configuration (figma.config.json)

```json
{
  "version": 3,
  "parser": "react",
  "include": "src/figma/**/*.figma.ts",
  "importPaths": {
    "@": "src/"
  },
  "paths": {
    "@/components/ui/*": "src/components/ui/"
  }
}
```

---

## 🎯 Next Steps

1. **Crear componentes en Figma** (usar FIGMA_IMPLEMENTATION_PLAN.md)
2. **Publicar componentes** a team library
3. **Instalar CLI:** `npm install -D @figma/code-connect`
4. **Autenticar:** `npx figma-code connect auth`
5. **Publicar templates:** `npx figma-code connect publish`
6. **En Figma**, los componentes mostrarán el código React automáticamente

---

## 🐛 Troubleshooting

### "No published components found"
- ✅ Asegúrate de publicar los componentes en Figma
- ✅ Click derecho → "Publish to Library"

### "Code Connect authentication failed"
- ✅ Ejecuta: `npx figma-code connect auth`
- ✅ Completa el flujo OAuth en el navegador

### "Template not syncing"
- ✅ Verifica que el `fileKey` en el URL sea correcto
- ✅ Verifica que `nodeId` sea válido
- ✅ Ejecuta: `npx figma-code connect publish --force`

---

## 📚 Resources

- [Figma Code Connect Docs](https://www.figma.com/developers/code-connect)
- [Code Connect API Reference](https://figma.com/developers/api)
- [FIGMA_IMPLEMENTATION_PLAN.md](FIGMA_IMPLEMENTATION_PLAN.md) - Guía de diseño

---

**Status:** ✅ Templates ready to use  
**Next:** Publish components in Figma and sync!
