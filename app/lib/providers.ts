export type Provider = 'anthropic' | 'openai' | 'google'

export type ModelDef = {
  id: string
  label: string
  provider: Provider
}

export const PROVIDERS: { id: Provider; name: string; placeholder: string }[] = [
  { id: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...' },
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
  { id: 'google', name: 'Google AI', placeholder: 'AIza...' },
]

export const MODELS: ModelDef[] = [
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', provider: 'anthropic' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', provider: 'anthropic' },
  { id: 'claude-opus-4-20250514', label: 'Claude Opus 4', provider: 'anthropic' },
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'google' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'google' },
]

export function getProviderForModel(modelId: string): Provider | null {
  return MODELS.find((m) => m.id === modelId)?.provider ?? null
}

export function getProviderName(provider: Provider): string {
  return PROVIDERS.find((p) => p.id === provider)?.name ?? provider
}
