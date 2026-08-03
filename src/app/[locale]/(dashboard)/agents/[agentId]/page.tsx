import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getAgent } from "@/lib/agents/actions";
import { getKnowledgeUnits } from "@/lib/knowledge/actions";
import { VisibilityToggle } from "@/components/shared/visibility-toggle";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";


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

  const agent = await getAgent(agentId);
  if (!agent) notFound();

  const status = agent.status as string;
  const selectedIds: string[] = agent.selected_ku_ids ?? [];

  // Resuelve los titulos de las KUs que componen el contexto del agente.
  const allKUs = await getKnowledgeUnits(locale);
  const linkedKUs = allKUs.filter((ku) => selectedIds.includes(ku.id));

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[#64748b]">
        <Link href="/agents" className="hover:text-[var(--star-1)] transition-colors">
          Agents
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#94a3b8]">{agent.name}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="headline-xl text-[var(--star-1)] font-bold">{agent.name}</h1>
          <StatusBadge status={status} size="sm" />
        </div>

        {agent.description && (
          <p className="body-md text-[#94a3b8]">{agent.description}</p>
        )}

        <dl className="flex items-center gap-6 flex-wrap body-sm text-[#64748b]">
          <div className="flex items-center gap-2">
            <dt>Proveedor</dt>
            <dd className="font-semibold text-[#94a3b8]">
              {agent.provider ?? "-"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Modelo</dt>
            <dd className="font-semibold text-[#94a3b8]">{agent.model}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Invocaciones</dt>
            <dd className="font-semibold text-[#94a3b8]">
              {(agent.invocations ?? 0).toLocaleString(locale)}
            </dd>
          </div>
          {agent.last_invoked_at && (
            <div className="flex items-center gap-2">
              <dt>Ultimo uso</dt>
              <dd className="font-semibold text-[#94a3b8]">
                {new Date(agent.last_invoked_at).toLocaleDateString(locale)}
              </dd>
            </div>
          )}
        </dl>
      </header>

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

      {/* Contexto compilado: las KUs que alimentan al agente */}
      <section className="panel p-6 space-y-4">
        <h2 className="section-heading">
          CONTEXTO ({linkedKUs.length}{" "}
          {linkedKUs.length === 1 ? "KNOWLEDGE UNIT" : "KNOWLEDGE UNITS"})
        </h2>

        {linkedKUs.length === 0 ? (
          <p className="body-md text-[#64748b]">
            Este agente todavia no tiene Knowledge Units asignadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {linkedKUs.map((ku) => (
              <li key={ku.id}>
                <Link
                  href={`/knowledge/${ku.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#1e293b] hover:bg-[#07090e] transition-colors"
                >
                  <span className="text-[#3b82f6]">
                    <Icon name="knowledge" size={18} />
                  </span>
                  <span className="body-md text-[var(--star-1)] flex-1">{ku.title}</span>
                  <span className="body-sm text-[#64748b]">{ku.domain}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {agent.system_prompt && (
        <section className="panel p-6">
          <h2 className="section-heading mb-4">SYSTEM PROMPT</h2>
          <pre className="body-sm text-[#94a3b8] whitespace-pre-wrap font-mono leading-relaxed">
            {agent.system_prompt}
          </pre>
        </section>
      )}
    </div>
  );
}
