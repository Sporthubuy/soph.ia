"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createOrganization } from "@/lib/knowledge/actions";
import {
  GUIDE_INTRO,
  SETUP_TEMPLATES,
  type SetupTemplateId,
} from "@/lib/knowledge/setup-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Step = "welcome" | "org" | "template" | "modules" | "review";

export const OnboardingForm = () => {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const [step, setStep] = useState<Step>("welcome");
  const [orgName, setOrgName] = useState("");
  const [templateId, setTemplateId] = useState<SetupTemplateId>("startup");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [includeStarter, setIncludeStarter] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const template = useMemo(
    () => SETUP_TEMPLATES.find((t) => t.id === templateId) ?? SETUP_TEMPLATES[0],
    [templateId]
  );

  const pickTemplate = (id: SetupTemplateId) => {
    setTemplateId(id);
    const t = SETUP_TEMPLATES.find((x) => x.id === id);
    if (t) {
      setSelectedModules(
        t.modules.filter((m) => m.recommended).map((m) => m.name)
      );
    }
  };

  const toggleModule = (name: string) => {
    setSelectedModules((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const moduleCountOk =
    selectedModules.length >= template.recommendedCount.min &&
    selectedModules.length <= template.recommendedCount.max + 2;

  const finish = async () => {
    if (!orgName.trim()) {
      setError("El nombre de la organizacion es obligatorio");
      setStep("org");
      return;
    }
    if (selectedModules.length === 0) {
      setError("Elegi al menos un modulo");
      setStep("modules");
      return;
    }
    setError(null);
    setLoading(true);

    const starterKus = includeStarter
      ? template.starterKus.filter((k) =>
          selectedModules.includes(k.domainName)
        )
      : [];

    const fd = new FormData();
    fd.set("name", orgName.trim());
    fd.set("templateId", templateId);
    fd.set("domains", JSON.stringify(selectedModules));
    fd.set("starterKus", JSON.stringify(starterKus));

    const result = await createOrganization(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const steps: { key: Step; label: string; num: number }[] = [
    { key: "welcome", label: "Guia", num: 1 },
    { key: "org", label: "Organizacion", num: 2 },
    { key: "template", label: "Plantilla", num: 3 },
    { key: "modules", label: "Modulos", num: 4 },
    { key: "review", label: "Listo", num: 5 },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className="relative flex flex-1 items-center justify-center bg-muted/30 px-4 py-10">
      <div className="dot-pattern absolute inset-0" />

      <div className="card-figma relative z-10 w-full max-w-2xl p-6 sm:p-8 animate-scale-in">
        {/* Progress */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i <= idx && setStep(s.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  i === idx
                    ? "bg-primary text-primary-foreground"
                    : i < idx
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[10px]">
                  {i < idx ? "✓" : s.num}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <span className="text-muted-foreground/30">→</span>
              )}
            </div>
          ))}
        </div>

        {/* ── Welcome ───────────────────────────── */}
        {step === "welcome" && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GuideIcon />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {GUIDE_INTRO.role}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                  Empecemos de cero, juntos
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {GUIDE_INTRO.message}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  t: "Quien te guia",
                  d: "SOPH.IA te lleva paso a paso. Vos decidís; la IA no crea conocimiento sin tu aprobacion.",
                },
                {
                  t: "Cuantos modulos",
                  d: "Recomendamos 3–6 dominios al inicio. Menos = simple. Mas = se vuelve dificil de gobernar.",
                },
                {
                  t: "Que sigue",
                  d: "Plantilla → modulos → primeras Knowledge Units → Review → Agent Compiler.",
                },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-sm font-semibold text-gray-900">{c.t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {c.d}
                  </p>
                </div>
              ))}
            </div>

            <Button
              className="w-full rounded-xl"
              size="lg"
              onClick={() => {
                pickTemplate("startup");
                setStep("org");
              }}
            >
              Empezar el setup →
            </Button>
          </div>
        )}

        {/* ── Org name ──────────────────────────── */}
        {step === "org" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Nombre de tu organizacion
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Es el espacio donde tu equipo versiona y gobierna conocimiento.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Nombre *
              </Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="ej. SportHub, Acme Labs, Estudio Norte"
                autoFocus
                className="input-figma"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setStep("welcome")}
              >
                ← Atras
              </Button>
              <Button
                className="flex-1 rounded-xl"
                disabled={!orgName.trim()}
                onClick={() => setStep("template")}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* ── Template ──────────────────────────── */}
        {step === "template" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Elige como empezar
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Una plantilla pre-arma modulos tipicos. Podes cambiarlos en el
                siguiente paso.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SETUP_TEMPLATES.map((t) => {
                const active = templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pickTemplate(t.id)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      active
                        ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                        : "bg-white hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {t.name}
                      </p>
                      <span className="text-[10px] font-medium text-primary">
                        {t.tagline}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setStep("org")}
              >
                ← Atras
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={() => setStep("modules")}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* ── Modules ───────────────────────────── */}
        {step === "modules" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Modulos de conocimiento
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Recomendado para{" "}
                <strong>{template.name}</strong>:{" "}
                {template.recommendedCount.min}–
                {template.recommendedCount.max} modulos. Ahora tenes{" "}
                <strong>{selectedModules.length}</strong> seleccionados.
              </p>
            </div>

            {!moduleCountOk && selectedModules.length > 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Tip: con menos de {template.recommendedCount.min} o mas de{" "}
                {template.recommendedCount.max + 2} el grafo se vuelve dificil
                de gobernar al inicio.
              </p>
            )}

            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {template.modules.map((m) => {
                const checked = selectedModules.includes(m.name);
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                      checked
                        ? "border-primary/40 bg-primary/[0.03]"
                        : "bg-white hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModule(m.name)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.name}</span>
                        {m.recommended && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-3">
              <input
                type="checkbox"
                checked={includeStarter}
                onChange={(e) => setIncludeStarter(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">
                  Incluir Knowledge Units de arranque
                </p>
                <p className="text-xs text-muted-foreground">
                  Creamos borradores listos para editar ({template.starterKus.length}{" "}
                  plantilla{template.starterKus.length !== 1 ? "s" : ""}). La IA
                  no aprueba nada sola.
                </p>
              </div>
            </label>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setStep("template")}
              >
                ← Atras
              </Button>
              <Button
                className="flex-1 rounded-xl"
                disabled={selectedModules.length === 0}
                onClick={() => setStep("review")}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* ── Review ────────────────────────────── */}
        {step === "review" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Resumen del proyecto
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Asi arranca <strong>{orgName || "tu organizacion"}</strong>.
                Despues te muestro el checklist de primeros pasos.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
              <Row label="Organizacion" value={orgName || "—"} />
              <Row label="Plantilla" value={template.name} />
              <Row
                label="Modulos"
                value={`${selectedModules.length}: ${selectedModules.join(", ")}`}
              />
              <Row
                label="KUs de arranque"
                value={
                  includeStarter
                    ? `${template.starterKus.filter((k) => selectedModules.includes(k.domainName)).length} borradores`
                    : "Ninguna"
                }
              />
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tu ruta despues de crear
              </p>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. Completar o editar las Knowledge Units en el Editor</li>
                <li>2. Proponer cambios y aprobarlos en Review Center</li>
                <li>3. Compilar un agente con KUs verificadas</li>
                <li>4. (Opcional) Publicar en el Marketplace</li>
              </ol>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setStep("modules")}
                disabled={loading}
              >
                ← Atras
              </Button>
              <Button
                className="flex-1 rounded-xl"
                size="lg"
                onClick={finish}
                disabled={loading}
              >
                {loading ? t("creating") : t("createProject")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-gray-900 sm:text-right">{value}</span>
  </div>
);

const GuideIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
  </svg>
);