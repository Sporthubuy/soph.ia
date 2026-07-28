/**
 * Resultado comun de las server actions mutadoras. Declara ambas claves (una
 * siempre `never`) para que los callers puedan leer `result?.error` y
 * `result?.success` sin narrowing explicito.
 */
export type ActionResult =
  | { success: true; error?: never }
  | { success?: never; error: string };
