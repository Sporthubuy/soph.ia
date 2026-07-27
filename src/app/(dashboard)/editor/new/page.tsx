import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDomains } from "@/lib/knowledge/actions";
import { KUCreateForm } from "@/components/editor/ku-form";

export default async function NewKUPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/graph");

  const domains = await getDomains(membership.organization_id);

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nueva Knowledge Unit</h1>
        <p className="mt-1 text-muted-foreground">
          Crea una nueva unidad de conocimiento. Se guardara como borrador.
        </p>
      </div>
      <div className="max-w-2xl">
        <KUCreateForm
          organizationId={membership.organization_id}
          domains={domains}
        />
      </div>
    </div>
  );
}
