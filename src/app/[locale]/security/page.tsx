import type { Metadata } from "next";
import { SimplePage, Prose, H, P } from "@/components/shared/simple-page";

export const metadata: Metadata = {
  title: "Security — soph.ia",
  description: "Cómo soph.ia protege el conocimiento de tu organización.",
};

const CONTROLS = [
  {
    h: "Row-Level Security",
    p: "Toda la data vive en PostgreSQL con RLS habilitado por organización. Un usuario nunca puede leer nodos de otra organización, ni siquiera por error de query.",
  },
  {
    h: "Claves por usuario",
    p: "Cada usuario autentica contra los modelos con su propia clave en el Model Router. Nunca compartimos una clave organizacional entre sesiones.",
  },
  {
    h: "Cifrado en tránsito y en reposo",
    p: "TLS 1.3 en tránsito y cifrado AES-256 en reposo para la capa relacional y vectorial. Las claves de cifrado se rotan trimestralmente.",
  },
  {
    h: "Audit trail inmutable",
    p: "Cada cambio a una Knowledge Unit deja un registro hash-encadenado. Ninguna edición puede alterar el historial sin romper la cadena.",
  },
  {
    h: "Soberanía de datos",
    p: "El conocimiento pertenece a quien lo crea. soph.ia no entrena modelos con tu data ni la expone a proveedores de IA externos.",
  },
  {
    h: "SOC 2 Type II",
    p: "Auditoría en curso. Compartimos el reporte completo (y los DPA) bajo NDA con clientes enterprise.",
  },
];

export default function SecurityPage() {
  return (
    <SimplePage eyebrow="Security" title="Diseñado para confiar." updated="3 de agosto, 2026">
      <Prose>
        {CONTROLS.map((c) => (
          <div key={c.h} className="rounded-2xl border border-[var(--edge)] bg-[var(--sky-2)] p-6">
            <H>{c.h}</H>
            <div className="mt-2">
              <P>{c.p}</P>
            </div>
          </div>
        ))}
      </Prose>
    </SimplePage>
  );
}