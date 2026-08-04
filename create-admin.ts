import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not found");
  process.exit(1);
}

if (!adminEmail || !adminPassword) {
  console.error("❌ Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin() {
  try {
    console.log("🔐 Creating admin user...\n");

    // Create user
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    const user = data?.user;

    if (createError) {
      if (createError.message.includes("already exists")) {
        console.log("⚠️  User already exists\n");
      } else {
        console.error("❌ Error creating user:", createError.message);
        process.exit(1);
      }
    } else if (user) {
      console.log("✅ User created successfully!");
      console.log("   Email:", user.email);
      console.log("   ID:", user.id);
      console.log("   Confirmed: Yes\n");

      // Set admin role
      const { error: roleError } = await supabase.from("admin_roles").upsert(
        {
          user_id: user.id,
          role: "admin",
        },
        { onConflict: "user_id" }
      );

      if (roleError) {
        console.error("❌ Error setting admin role:", roleError.message);
        process.exit(1);
      }

      console.log("✅ Admin role assigned!\n");
    }

    // Verify
    console.log("✅ Setup Complete!\n");
    console.log("📝 Login credentials:");
    console.log("   Email:", adminEmail);
    console.log("   Password: (the value of ADMIN_PASSWORD)\n");
    console.log("🌐 Admin URL: http://localhost:3000/login/admin");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAdmin();
