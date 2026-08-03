import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import "@/app/globals.css";

export const metadata = {
  title: "SOPH.IA Admin",
  description: "Administration panel for SOPH.IA platform",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check admin authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check if user is admin
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("*")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!adminRole) {
    redirect("/admin/login");
  }

  return (
    <html lang="en">
      <body className="bg-[#07090e] text-[#94a3b8]">
        <div className="flex h-screen">
          {/* Admin Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Admin Header */}
            <AdminHeader />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-6 max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
