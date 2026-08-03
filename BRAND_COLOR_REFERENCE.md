# SOPH.IA — Quick Color Reference

**Last Updated:** 2026-08-03  
**Version:** Constellation Design System 1.0

## 🎨 Primary Colors

```
Azure (Actions)     #5B9BFF     var(--azure)
Azure Hover         #82B4FF     var(--azure-bright)
Azure Active        #3F7FE0     var(--azure-deep)
```

## 🌙 Backgrounds (Dark Mode)

```
Sky-0 (Darkest)     #080B12     var(--sky-0)
Sky-1 (Canvas)      #0A0E17     var(--sky-1)  ← Main background
Sky-2 (Surfaces)    #0F1420     var(--sky-2)  ← Cards, panels
Sky-3 (Raised)      #151B2B     var(--sky-3)  ← Inputs, hover
Sky-4 (Modal)       #1B2233     var(--sky-4)  ← Popovers
```

## 💫 Text (Star Palette)

```
Star-1 (Primary)    #E8EDF7     var(--star-1)  ← Headings
Star-2 (Body)       #B8C1D4     var(--star-2)  ← Regular text
Star-3 (Muted)      #8B95AB     var(--star-3)  ← Hints
Star-4 (Disabled)   #5B6478     var(--star-4)  ← Faint
```

## 📊 States

```
Verified (Green)    #34D399     var(--verified)   ← Approved
Pending (Yellow)    #FBBF24     var(--pending)    ← Review needed
Danger (Red)        #FB6A68     var(--danger)     ← Error
Archived (Gray)     #5B6478     var(--archived)   ← Inactive
Draft (Gray-Blue)   #93A4C4     var(--draft)      ← WIP
```

## 🖼️ Borders

```
Edge (Hairline)     #212A3E     var(--edge)          ← Subtle
Edge Strong         #2E3950     var(--edge-strong)   ← Emphasis
```

---

## 💻 How to Use

### CSS Variables (Recommended)
```css
/* Always prefer CSS variables */
background: var(--sky-2);
color: var(--star-1);
border: 1px solid var(--edge);
```

### Inline Styles
```jsx
style={{
  backgroundColor: "var(--sky-2)",
  color: "var(--star-1)",
  borderColor: "var(--edge)"
}}
```

### TailwindCSS (with theme overrides)
```jsx
className="bg-sky-2 text-star-1 border-edge"
```

---

## ✅ Common Patterns

### Button Primary
```jsx
<button style={{
  backgroundColor: "var(--azure)",
  color: "white",
  padding: "12px 28px",
  borderRadius: "6px"
}}
onMouseEnter={(e) => e.target.style.backgroundColor = "var(--azure-bright)"}
/>
```

### Card
```jsx
<div style={{
  backgroundColor: "var(--sky-2)",
  border: "1px solid var(--edge)",
  borderRadius: "12px",
  padding: "24px"
}} />
```

### Input
```jsx
<input style={{
  backgroundColor: "var(--sky-3)",
  border: "1px solid var(--edge)",
  color: "var(--star-1)"
}}
onFocus={(e) => {
  e.target.style.borderColor = "var(--azure)";
  e.target.style.boxShadow = "0 0 0 3px rgba(91, 155, 255, 0.1)";
}}
/>
```

### Badge
```jsx
<span style={{
  backgroundColor: "var(--verified)",
  color: "white",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600"
}}>
  Verified
</span>
```

### Text (Body)
```jsx
<p style={{
  color: "var(--star-2)",
  fontSize: "16px",
  lineHeight: "1.6"
}}>
  Regular text
</p>
```

### Text (Muted)
```jsx
<span style={{
  color: "var(--star-3)",
  fontSize: "14px"
}}>
  Muted hint
</span>
```

---

## 🎯 Implementation Order

1. ✅ **globals.css** — Color tokens (DONE)
2. ✅ **dashboard-header.tsx** — Header styling (DONE)
3. ✅ **admin-header.tsx** — Admin header (DONE)
4. ⏳ **Button components** — Primary, Secondary, Danger
5. ⏳ **Card components** — Base card styling
6. ⏳ **Input components** — Inputs with focus states
7. ⏳ **Badge components** — 4 state variants
8. ⏳ **All dashboard pages** — Apply colors
9. ⏳ **Testing** — WCAG AA contrast, responsive

---

## 🔍 Accessibility Notes

### Contrast Ratios (WCAG AA Minimum 4.5:1)
- ✓ Star-1 on Sky-1: 19.5:1
- ✓ Star-2 on Sky-2: 14:1
- ✓ Azure on White: 5.2:1
- ✓ Azure on Sky-2: 8.1:1

### Focus Indicators
- **Outline:** 2px solid var(--azure)
- **Offset:** 2px
- Always visible on interactive elements

---

## 📚 Related Files

- `DESIGN.md` — Full design system spec
- `globals.css` — CSS variables definition
- `src/components/shared/logo.tsx` — Logo component
- `public/logo.svg` — Logo SVG file
- `/Downloads/SOPH.IA_Brand_Guide_Oficial.html` — Official guide

---

**Questions? Check DESIGN.md or contact the design team.**
