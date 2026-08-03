import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkAdminRole() {
  const { data, error } = await supabase
    .from("admin_roles")
    .select("*")
    .eq("user_id", "f09c0d11-e5f6-474a-bff6-d9cc0aebcfb4");

  console.log("Admin role data:", data);
  console.log("Error:", error?.message);
}

checkAdminRole();
