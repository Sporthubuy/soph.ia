import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getAgent } from "@/lib/agents/actions";
import { getKnowledgeUnits } from "@/lib/knowledge/actions";
import { VisibilityToggle } from "@/components/shared/visibility-toggle";
import { Icon } from "@/components/shared/icon";

/** Estados validos del check constraint de public.agents. */
const STATUS_STYLES: Record<string, string> = {
  deployed: "bg-[rgb(52_211_153_/_0.12)] text-[var(--verified)] border-[rgb(52_211_153_/_0.28)]",
  draft: "bg-[rgb(251_191_36_/_0.12)] text-[var(--pending)] border-[rgb(251_191_36_/_0.28)]",
  paused: "bg-[rgb(251_191_36_/_0.12)] text-[var(--pending)] border-[rgb(251_191_36_/_0.28)]",
  archived: "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]",
};

const STATUS_LABELS: Record<string, string> = {
  deployed: "Desplegado",
  draft: "Borrador",
  paused: "En pausa",
  archived: "Archivado",
};

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
      <nav aria-label="Migas de pan" className="body-sm text-[#8b95ab]">
        <Link href="/agents" className="hover:text-[var(--star-1)] transition-colors">
          Agents
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#b8c1d4]">{agent.name}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="headline-xl text-[var(--star-1)] font-bold">{agent.name}</h1>
          <span
            className={`label-sm px-2 py-1 rounded border ${
              STATUS_STYLES[status] ?? STATUS_STYLES.archived
            }`}
          >
            {STATUS_LABELS[status] ??
              status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {agent.description && (
          <p className="body-md text-[#b8c1d4]">{agent.description}</p>
        )}

        <dl className="flex items-center gap-6 flex-wrap body-sm text-[#8b95ab]">
          <div className="flex items-center gap-2">
            <dt>Proveedor</dt>
            <dd className="font-semibold text-[#b8c1d4]">
              {agent.provider ?? "-"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Modelo</dt>
            <dd className="font-semibold text-[#b8c1d4]">{agent.model}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Invocaciones</dt>
            <dd className="font-semibold text-[#b8c1d4]">
              {(agent.invocations ?? 0).toLocaleString(locale)}
            </dd>
          </div>
          {agent.last_invoked_at && (
            <div className="flex items-center gap-2">
              <dt>Ultimo uso</dt>
              <dd className="font-semibold text-[#b8c1d4]">
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
          <p className="body-md text-[#8b95ab]">
            Este agente todavia no tiene Knowledge Units asignadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {linkedKUs.map((ku) => (
              <li key={ku.id}>
                <Link
                  href={`/knowledge/${ku.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#212a3e] hover:bg-[#0a0e17] transition-colors"
                >
                  <span className="text-[#5b9bff]">
                    <Icon name="knowledge" size={18} />
                  </span>
                  <span className="body-md text-[var(--star-1)] flex-1">{ku.title}</span>
                  <span className="body-sm text-[#8b95ab]">{ku.domain}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {agent.system_prompt && (
        <section className="panel p-6">
          <h2 className="section-heading mb-4">SYSTEM PROMPT</h2>
          <pre className="body-sm text-[#b8c1d4] whitespace-pre-wrap font-mono leading-relaxed">
            {agent.system_prompt}
          </pre>
        </section>
      )}
    </div>
  );
}
