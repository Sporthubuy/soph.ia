"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type Provider = "anthropic" | "openai" | "gemini" | "deepseek" | "nvidia";

const PROVIDERS = [
  { id: "anthropic", name: "Anthropic Claude", icon: "💰", type: "Pago", desc: "Acceso a Claude 3.5 Sonnet" },
  { id: "openai", name: "OpenAI GPT-4", icon: "💰", type: "Pago", desc: "Acceso a GPT-4 y GPT-4o" },
  { id: "gemini", name: "Google Gemini", icon: "🆓", type: "Gratis", desc: "60 requests/min sin API key" },
  { id: "deepseek", name: "DeepSeek", icon: "🆓", type: "Gratis", desc: "Modelo abierto de DeepSeek" },
  { id: "nvidia", name: "Nvidia NIM", icon: "🆓", type: "Gratis", desc: "Modelos abiertos en Nvidia" },
];

export const AIProviderSettings = () => {
  const t = useTranslations("settings");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    anthropic: "",
    openai: "",
  });
  const [savedProviders, setSavedProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSave = async (provider: Provider) => {
    setLoading(true);
    try {
      // Guardar en localStorage por ahora (después en Supabase)
      const stored = JSON.parse(localStorage.getItem("aiProviders") || "{}");
      stored[provider] = apiKeys[provider];
      localStorage.setItem("aiProviders", JSON.stringify(stored));

      setSavedProviders((prev) =>
        prev.includes(provider) ? prev : [...prev, provider]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="section-heading">AI PROVIDERS</h2>
        <p className="body-sm text-[#7c839b]">
          Configura tus credenciales para usar diferentes modelos de IA
        </p>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((provider) => (
          <div key={provider.id} className="border border-[#e2e8f0] rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{provider.icon}</span>
                  <div>
                    <p className="body-md font-medium text-black">{provider.name}</p>
                    <p className="label-xs text-[#7c839b]">{provider.desc}</p>
                  </div>
                </div>
              </div>
              <span className={`label-xs px-2 py-1 rounded ${
                provider.type === "Pago"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}>
                {provider.type}
              </span>
            </div>

            {["anthropic", "openai"].includes(provider.id) && (
              <div className="space-y-2">
                <Label className="text-xs text-[#7c839b]">
                  {provider.id === "anthropic" ? "Anthropic API Key" : "OpenAI API Key"}
                </Label>
                <Input
                  type="password"
                  placeholder={`sk-${provider.id === "anthropic" ? "ant" : "proj"}...`}
                  value={apiKeys[provider.id as Provider] || ""}
                  onChange={(e) => setApiKeys((prev) => ({
                    ...prev,
                    [provider.id]: e.target.value,
                  }))}
                  className="input-figma"
                />
                <Button
                  size="sm"
                  variant={savedProviders.includes(provider.id as Provider) ? "default" : "outline"}
                  onClick={() => handleSave(provider.id as Provider)}
                  disabled={loading || !apiKeys[provider.id as Provider]}
                  className="rounded-lg"
                >
                  {savedProviders.includes(provider.id as Provider) ? "✓ Guardado" : "Guardar"}
                </Button>
              </div>
            )}

            {["gemini", "deepseek", "nvidia"].includes(provider.id) && (
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="label-sm text-emerald-700">
                  ✓ Listo para usar sin configuración
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 space-y-2">
        <p className="label-sm font-medium text-emerald-900">✓ Activo</p>
        <p className="body-sm text-emerald-700">
          Ya puedes seleccionar el proveedor de IA al crear agentes. Los agentes usarán el proveedor que selecciones aquí.
        </p>
      </div>
    </section>
  );
};
