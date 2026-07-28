import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el organization_id del usuario autenticado.
 *
 * Nunca cae de vuelta a user.id: un usuario no es una organizacion, y usar su id
 * como organization_id produce lecturas vacias y escrituras rechazadas por RLS.
 * Si el usuario no tiene membership, esto es un error de datos y debe fallar.
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  return data?.organization_id ?? null;
}
