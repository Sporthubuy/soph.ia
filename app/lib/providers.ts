export type Provider = 'anthropic' | 'openai' | 'google' | 'deepseek' | 'mistral' | 'xai'

export type ModelDef = {
  id: string
  label: string
  provider: Provider
}

export const PROVIDERS: { id: Provider; name: string; placeholder: string; color: string; initial: string }[] = [
  { id: 'anthropic', name: 'Anthropic',  placeholder: 'sk-ant-...',  color: '#D97757', initial: 'A' },
  { id: 'openai',    name: 'OpenAI',     placeholder: 'sk-...',       color: '#10A37F', initial: 'O' },
  { id: 'google',    name: 'Google AI',  placeholder: 'AIza...',      color: '#4285F4', initial: 'G' },
  { id: 'deepseek',  name: 'DeepSeek',   placeholder: 'sk-...',       color: '#4D6BFE', initial: 'D' },
  { id: 'mistral',   name: 'Mistral AI', placeholder: 'Bearer ...',   color: '#FF7000', initial: 'M' },
  { id: 'xai',       name: 'xAI (Grok)', placeholder: 'xai-...',      color: '#1A1A1A', initial: 'X' },
]

export const MODELS: ModelDef[] = [
  // Anthropic
  { id: 'claude-opus-4-20250514',    label: 'Claude Opus 4',      provider: 'anthropic' },
  { id: 'claude-sonnet-4-20250514',  label: 'Claude Sonnet 4',    provider: 'anthropic' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5',   provider: 'anthropic' },
  // OpenAI
  { id: 'gpt-4o',                    label: 'GPT-4o',             provider: 'openai' },
  { id: 'gpt-4o-mini',               label: 'GPT-4o Mini',        provider: 'openai' },
  { id: 'o3',                        label: 'o3',                 provider: 'openai' },
  { id: 'o4-mini',                   label: 'o4-mini',            provider: 'openai' },
  // Google
  { id: 'gemini-2.5-pro',            label: 'Gemini 2.5 Pro',     provider: 'google' },
  { id: 'gemini-2.5-flash',          label: 'Gemini 2.5 Flash',   provider: 'google' },
  // DeepSeek
  { id: 'deepseek-chat',             label: 'DeepSeek V3',        provider: 'deepseek' },
  { id: 'deepseek-reasoner',         label: 'DeepSeek R1',        provider: 'deepseek' },
  // Mistral
  { id: 'mistral-large-latest',      label: 'Mistral Large',      provider: 'mistral' },
  { id: 'mistral-small-latest',      label: 'Mistral Small',      provider: 'mistral' },
  // xAI
  { id: 'grok-3',                    label: 'Grok 3',             provider: 'xai' },
  { id: 'grok-3-mini',               label: 'Grok 3 Mini',        provider: 'xai' },
]

export const OPENAI_COMPATIBLE_BASES: Partial<Record<Provider, string>> = {
  openai:   'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  mistral:  'https://api.mistral.ai/v1',
  xai:      'https://api.x.ai/v1',
}

export function getProviderForModel(modelId: string): Provider | null {
  return MODELS.find((m) => m.id === modelId)?.provider ?? null
}

export function getProviderName(provider: Provider): string {
  return PROVIDERS.find((p) => p.id === provider)?.name ?? provider
}
