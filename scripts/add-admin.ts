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

async function addAdmin() {
  try {
    console.log("🔐 Adding admin role to rg.aviaga@gmail.com...");

    const userId = "f09c0d11-e5f6-474a-bff6-d9cc0aebcfb4";

    // Set admin role
    const { error: roleError } = await supabase.from("admin_roles").upsert({
      user_id: userId,
      role: "admin",
    });

    if (roleError) {
      console.error("Error assigning admin role:", roleError.message);
      process.exit(1);
    }

    console.log("✅ Admin role assigned successfully!");
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: rg.aviaga@gmail.com`);
    console.log(`   Role: admin`);
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

addAdmin();
