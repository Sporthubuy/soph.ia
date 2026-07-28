# Componentes pendientes de conectar

Estos componentes fueron construidos pero nunca se cablearon a una ruta.
Importan server actions que todavia no existen en `src/lib/*/actions.ts`
(`deployAgent`, `updateOrganization`, `createDomain`, `updateMemberRole`, etc.).

Estan excluidos de `tsconfig.json` para que `npm run build` pase. Al conectar
cada feature: escribir sus actions, mover el componente de vuelta a
`src/components/<area>/` y crear su ruta en `src/app/[locale]/(dashboard)/`.

Referencia: `review/` ya siguio este camino (actions + ruta `/review`).
