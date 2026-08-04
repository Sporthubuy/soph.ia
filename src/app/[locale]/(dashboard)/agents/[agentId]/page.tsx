import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getAgent, getPublicAgent, getAgentReviews } from "@/lib/agents/actions";
import { getKnowledgeUnits } from "@/lib/knowledge/actions";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";
import { VisibilityToggle } from "@/components/shared/visibility-toggle";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { AgentRating } from "@/components/marketplace/agent-rating";
import { CloneButton } from "@/components/marketplace/clone-button";
import { AgentReviewsList } from "@/components/marketplace/agent-reviews-list";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ locale: string; agentId: string }>;
}) {
  const { locale, agentId } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const organizationId = await getCurrentOrganizationId();

  // Try own org first
  let agent = await getAgent(agentId);

  // If not found or private, try public lookup
  if (!agent && user) {
    agent = await getPublicAgent(agentId);
  }

  if (!agent) notFound();

  const status = agent.status as string;
  const selectedIds: string[] = agent.selected_ku_ids ?? [];

  // Resuelve los titulos de las KUs que componen el contexto del agente.
  const allKUs = await getKnowledgeUnits(locale);
  const linkedKUs = allKUs.filter((ku) => selectedIds.includes(ku.id));

  // Fetch reviews only for public agents
  const reviews =
    agent.visibility === "public" ? await getAgentReviews(agentId) : [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[var(--star-4)]">
        <Link href="/agents" className="hover:text-[var(--star-1)] transition-colors">
          Agents
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--star-3)]">{agent.name}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="headline-xl text-[var(--star-1)] font-bold">{agent.name}</h1>
          <StatusBadge status={status} size="sm" />
        </div>

        {agent.description && (
          <p className="body-md text-[var(--star-3)]">{agent.description}</p>
        )}

        <dl className="flex items-center gap-6 flex-wrap body-sm text-[var(--star-4)]">
          <div className="flex items-center gap-2">
            <dt>Proveedor</dt>
            <dd className="font-semibold text-[var(--star-3)]">
              {agent.provider ?? "-"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Modelo</dt>
            <dd className="font-semibold text-[var(--star-3)]">{agent.model}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Invocaciones</dt>
            <dd className="font-semibold text-[var(--star-3)]">
              {(agent.invocations ?? 0).toLocaleString(locale)}
            </dd>
          </div>
          {agent.last_invoked_at && (
            <div className="flex items-center gap-2">
              <dt>Ultimo uso</dt>
              <dd className="font-semibold text-[var(--star-3)]">
                {new Date(agent.last_invoked_at).toLocaleDateString(locale)}
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* Only show for own agents */}
      {organizationId === agent.organization_id && (
        <section className="panel p-6">
          <h2 className="section-heading mb-4">COMPARTIR</h2>
          <VisibilityToggle
            itemId={agentId}
            itemType="agent"
            currentVisibility={agent.visibility ?? "private"}
            organizationId={agent.organization_id}
            onlyOwner={agent.created_by !== user?.id}
          />
        </section>
      )}

      {/* Show for public agents from other orgs */}
      {agent.visibility === "public" && organizationId !== agent.organization_id && user && (
        <section className="panel p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="sparkle" size={18} className="text-[var(--azure)]" />
            <h2 className="section-heading">MARKETPLACE</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CloneButton agentId={agentId} />
            <AgentRating agentId={agentId} initialRating={null} initialReview={null} />
          </div>

          <p className="body-sm text-[var(--star-4)]">
            This agent is available in the marketplace. Clone it to your workspace to customize and use it with your own Knowledge Units.
          </p>
        </section>
      )}

      {/* Contexto compilado: las KUs que alimentan al agente */}
      <section className="panel p-6 space-y-4">
        <h2 className="section-heading">
          CONTEXTO ({linkedKUs.length}{" "}
          {linkedKUs.length === 1 ? "KNOWLEDGE UNIT" : "KNOWLEDGE UNITS"})
        </h2>

        {linkedKUs.length === 0 ? (
          <p className="body-md text-[var(--star-4)]">
            Este agente todavia no tiene Knowledge Units asignadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {linkedKUs.map((ku) => (
              <li key={ku.id}>
                <Link
                  href={`/knowledge/${ku.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--edge)] hover:bg-[var(--sky-1)] transition-colors"
                >
                  <span className="text-[#3b82f6]">
                    <Icon name="knowledge" size={18} />
                  </span>
                  <span className="body-md text-[var(--star-1)] flex-1">{ku.title}</span>
                  <span className="body-sm text-[var(--star-4)]">{ku.domain}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {agent.system_prompt && (
        <section className="panel p-6">
          <h2 className="section-heading mb-4">SYSTEM PROMPT</h2>
          <pre className="body-sm text-[var(--star-3)] whitespace-pre-wrap font-mono leading-relaxed">
            {agent.system_prompt}
          </pre>
        </section>
      )}

      {/* Reviews section for public agents */}
      {agent.visibility === "public" && reviews.length > 0 && (
        <section className="panel p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="chart" size={18} className="text-[var(--pending)]" />
            <h2 className="section-heading">
              COMMUNITY REVIEWS ({reviews.length})
            </h2>
          </div>
          <AgentReviewsList reviews={reviews} />
        </section>
      )}
    </div>
  );
}
