import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upyyjwyvkbvjjfxhntzc.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin() {
  try {
    console.log("🔐 Creating admin user...\n");

    // Create user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: "rg.aviaga@gmail.com",
      password: "Xaxi.41123871",
      email_confirm: true,
    });

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
    console.log("   Email: rg.aviaga@gmail.com");
    console.log("   Password: Xaxi.41123871\n");
    console.log("🌐 Admin URL: http://localhost:3000/login/admin");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAdmin();
