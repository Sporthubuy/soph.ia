import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createAdminProfile() {
  try {
    console.log("Creating admin profile...");

    const { error } = await supabase.from("profiles").upsert({
      id: "f09c0d11-e5f6-474a-bff6-d9cc0aebcfb4",
      email: "rg.aviaga@gmail.com",
      full_name: "Rodrigo García",
      avatar_url: null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating profile:", error.message);
      process.exit(1);
    }

    console.log("✅ Admin profile created successfully!");
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

createAdminProfile();
