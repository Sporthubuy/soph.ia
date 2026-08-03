import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: "rg.aviaga@gmail.com",
      password: "Xaxi.4112",
      email_confirm: true,
    });

    if (createError && !createError.message.includes("already exists")) {
      console.error("Error:", createError.message);
      process.exit(1);
    }

    const userId = user?.id;
    if (userId) {
      console.log("✓ Admin user created");

      // Set admin role
      await supabase.from("admin_roles").upsert({
        user_id: userId,
        role: "admin",
      });

      console.log("✓ Admin role assigned");
    }

    console.log("✅ Seed completed!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
