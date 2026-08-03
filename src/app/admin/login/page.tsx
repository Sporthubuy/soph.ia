import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, redirect to admin dashboard
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-[#3b82f6]">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-[var(--star-1)]">
            SOPH.IA
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">Admin Panel</p>
        </div>

        {/* Login Form */}
        <form
          action={async (formData) => {
            "use server";
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            if (!email || !password) {
              return;
            }

            const supabase = await createClient();
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              // TODO: Handle error
              return;
            }

            redirect("/admin");
          }}
          className="space-y-6 rounded-lg border border-[#1e293b] bg-[#0f1117] p-6"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8]">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#3b82f6] py-2 font-medium text-white hover:bg-[#2563eb] transition-colors"
          >
            Sign in
          </button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-[#64748b]">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
