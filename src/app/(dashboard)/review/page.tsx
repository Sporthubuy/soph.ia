import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProposedKnowledgeUnits } from "@/lib/knowledge/actions";
import { ReviewList } from "@/components/review/review-list";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return null;

  const proposals = await getProposedKnowledgeUnits(
    membership.organization_id
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Review Center</h1>
        <p className="mt-1 text-muted-foreground">
          Revisa, aprueba o rechaza los cambios propuestos al conocimiento.
        </p>
      </div>
      <ReviewList proposals={proposals} userRole={membership.role} />
    </div>
  );
}
