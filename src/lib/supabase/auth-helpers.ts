"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const getAuthenticatedUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
};

export const getUserOrganization = async () => {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role, organizations(id, name, slug)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  return { supabase, user, membership };
};
