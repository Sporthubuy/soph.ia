import type { Metadata } from "next";
import { SimplePage, Prose, P } from "@/components/shared/simple-page";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Status — soph.ia",
  description: "Estado operativo de la plataforma soph.ia.",
};

const SERVICES = [
  { name: "Knowledge Graph", status: "Operational", latency: "32ms" },
  { name: "Agent Compiler", status: "Operational", latency: "480ms" },
  { name: "Model Router", status: "Operational", latency: "212ms" },
  { name: "Supabase (PostgreSQL + pgvector)", status: "Operational", latency: "18ms" },
  { name: "Neo4j Aura", status: "Operational", latency: "41ms" },
  { name: "API & Edge Functions", status: "Operational", latency: "66ms" },
];

export default function StatusPage() {
  return (
    <SimplePage eyebrow="Status" title="Todo en funcionamiento." updated="3 de agosto, 2026">
      <Prose>
        <div className="overflow-hidden rounded-2xl border border-[var(--edge)]">
          {SERVICES.map((s, i) => (
            <div
              key={s.name}
              className={`flex min-h-[3.5rem] items-center justify-between gap-4 px-5 py-3 ${
                i > 0 ? "border-t border-[var(--edge)]" : ""
              } bg-[var(--sky-2)]`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="anim-node h-2 w-2 rounded-full bg-[var(--verified)]"
                  aria-hidden
                />
                <span className="text-sm font-medium text-[var(--star-1)]">{s.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden font-mono text-xs text-[var(--star-4)] sm:inline">
                  {s.latency}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--verified)]">
                  <Check size={14} aria-hidden /> {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <P>
          El estado refleja la disponibilidad de los servicios centrales de la
          plataforma en los últimos 90 días. El historial de incidentes y el
          uptime acumulado están disponibles para clientes enterprise.
        </P>
      </Prose>
    </SimplePage>
  );
}