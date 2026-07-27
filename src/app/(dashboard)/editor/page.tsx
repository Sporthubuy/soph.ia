import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKnowledgeUnits, getDomains } from "@/lib/knowledge/actions";
import { KUList } from "@/components/editor/ku-list";

export default async function EditorPage() {
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

  if (!membership) return null;

  const [knowledgeUnits, domains] = await Promise.all([
    getKnowledgeUnits(membership.organization_id),
    getDomains(membership.organization_id),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Knowledge Units</h1>
        <p className="mt-1 text-muted-foreground">
          Crea, edita y gestiona el conocimiento de tu organizacion.
        </p>
      </div>
      <KUList knowledgeUnits={knowledgeUnits} domains={domains} />
    </div>
  );
}
