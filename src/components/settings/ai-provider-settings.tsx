"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toast";

type Provider = "anthropic" | "openai" | "google" | "deepseek" | "nvidia";

const PROVIDERS = [
  { id: "anthropic", name: "Anthropic Claude", icon: "💰", type: "Pago", desc: "Acceso a Claude 3.5 Sonnet", needsKey: true },
  { id: "openai", name: "OpenAI GPT-4", icon: "💰", type: "Pago", desc: "Acceso a GPT-4 y GPT-4o", needsKey: true },
  { id: "google", name: "Google Gemini", icon: "🆓", type: "Gratis", desc: "Gemini API con tu key", needsKey: true },
  { id: "deepseek", name: "DeepSeek", icon: "🆓", type: "Gratis", desc: "Modelo abierto de DeepSeek", needsKey: true },
  { id: "nvidia", name: "Nvidia NIM", icon: "🆓", type: "Gratis", desc: "Modelos abiertos en Nvidia", needsKey: true },
];

interface SavedProvider {
  id: string;
  provider: string;
  model_name?: string;
  is_active: boolean;
}

export const AIProviderSettings = () => {
  const t = useTranslations("settings");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [modelNames, setModelNames] = useState<Record<string, string>>({});
  const [savedProviders, setSavedProviders] = useState<SavedProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Load user's saved providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch("/api/user/ai-providers");
        if (res.ok) {
          const data = await res.json();
          setSavedProviders(data.providers || []);
        }
      } catch (error) {
        console.error("Failed to load providers:", error);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, []);

  const handleSave = async (provider: Provider) => {
    if (!apiKeys[provider]) {
      toast.add({ type: "error", title: "Error", description: "API key es requerida" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/ai-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKeys[provider],
          modelName: modelNames[provider] || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save provider");
      }

      const data = await res.json();
      setSavedProviders((prev) => {
        const filtered = prev.filter((p) => p.provider !== provider);
        return [...filtered, data.data];
      });

      toast.add({ type: "success", title: "Guardado", description: `${provider} configurado correctamente` });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Error guardando provider",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, provider: string) => {
    try {
      const res = await fetch(`/api/user/ai-providers?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setSavedProviders((prev) => prev.filter((p) => p.id !== id));
      setApiKeys((prev) => ({ ...prev, [provider]: "" }));
      toast.add({ type: "success", title: "Eliminado", description: `${provider} ha sido removido` });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Error",
        description: "Error al eliminar el provider",
      });
    }
  };

  const isSaved = (provider: string) => savedProviders.some((p) => p.provider === provider);

  return (
    <section className="panel p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="section-heading">AI PROVIDERS</h2>
        <p className="body-sm text-[#7c839b]">
          Configura tus credenciales para usar diferentes modelos de IA en tus agentes
        </p>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((provider) => {
          const saved = savedProviders.find((p) => p.provider === provider.id);
          return (
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

              {saved ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
                    <p className="label-sm text-emerald-700">✓ Configurado</p>
                    {saved.model_name && (
                      <p className="label-xs text-emerald-600">Modelo: {saved.model_name}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(saved.id, provider.id)}
                    className="rounded-lg w-full text-red-600 hover:bg-red-50"
                  >
                    Remover configuración
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-[#7c839b]">
                      {provider.id === "anthropic" && "Anthropic API Key"}
                      {provider.id === "openai" && "OpenAI API Key"}
                      {provider.id === "google" && "Google AI API Key"}
                      {provider.id === "deepseek" && "DeepSeek API Key"}
                      {provider.id === "nvidia" && "Nvidia NIM API Key"}
                    </Label>
                    <Input
                      type="password"
                      placeholder={`sk-${provider.id === "anthropic" ? "ant" : "proj"}...`}
                      value={apiKeys[provider.id] || ""}
                      onChange={(e) => setApiKeys((prev) => ({
                        ...prev,
                        [provider.id]: e.target.value,
                      }))}
                      className="input-figma mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[#7c839b]">
                      Modelo (opcional)
                    </Label>
                    <Input
                      type="text"
                      placeholder={`ej: gpt-4, claude-3-5-sonnet-latest`}
                      value={modelNames[provider.id] || ""}
                      onChange={(e) => setModelNames((prev) => ({
                        ...prev,
                        [provider.id]: e.target.value,
                      }))}
                      className="input-figma mt-1"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSave(provider.id as Provider)}
                    disabled={loading || !apiKeys[provider.id]}
                    className="rounded-lg w-full"
                  >
                    {loading ? "Guardando..." : "Guardar API Key"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2">
        <p className="label-sm font-medium text-blue-900">💡 Cómo funciona</p>
        <p className="body-sm text-blue-700">
          Las API keys se guardan de forma segura en tu cuenta. Cuando creas un agente y seleccionas un provider,
          el agente usará tu API key para hacer las consultas. Cada miembro del equipo debe configurar sus propias keys.
        </p>
      </div>
    </section>
  );
};
