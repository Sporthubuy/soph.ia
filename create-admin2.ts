import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upyyjwyvkbvjjfxhntzc.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin() {
  try {
    console.log("🔐 Creating admin user...\n");

    // Try to create user
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: "rg.aviaga@gmail.com",
      password: "Xaxi.41123871",
      email_confirm: true,
    });

    let userId: string | undefined;

    if (createError) {
      console.log("⚠️  User may already exist, checking...\n");
    } else if (data?.user) {
      userId = data.user.id;
      console.log("✅ User created successfully!");
      console.log("   Email: rg.aviaga@gmail.com");
      console.log("   ID:", userId, "\n");
    }

    // If we don't have ID, get it from the database
    if (!userId) {
      const { data: adminUsers, error: getError } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", "rg.aviaga@gmail.com")
        .single();

      if (getError || !adminUsers) {
        // User doesn't exist, try creating again
        console.log("📍 Attempting to fetch user ID...");
        const response = await fetch(
          `${supabaseUrl}/auth/v1/admin/users`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("❌ Could not fetch users:", await response.text());
          process.exit(1);
        }

        const users = await response.json();
        const adminUser = users.find(
          (u: any) => u.email === "rg.aviaga@gmail.com"
        );

        if (adminUser) {
          userId = adminUser.id;
          console.log("✓ Found user ID:", userId);
        }
      } else {
        userId = adminUsers.id;
        console.log("✓ Found existing user ID:", userId);
      }
    }

    // Set admin role
    if (userId) {
      const { error: roleError } = await supabase
        .from("admin_roles")
        .upsert(
          {
            user_id: userId,
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

    console.log("✅ Setup Complete!\n");
    console.log("📝 Login credentials:");
    console.log("   Email: rg.aviaga@gmail.com");
    console.log("   Password: Xaxi.41123871\n");
    console.log("🌐 Admin URL: http://localhost:3000/login/admin\n");
    console.log("✨ Ready to login!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAdmin();
