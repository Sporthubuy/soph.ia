import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type ProviderId = "anthropic" | "openai" | "google" | "deepseek" | "nvidia";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  provider?: ProviderId;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

const DEFAULT_MODELS: Record<ProviderId, string> = {
  anthropic: "claude-3-5-sonnet-latest",
  openai: "gpt-4o-mini",
  google: "gemini-1.5-flash",
  deepseek: "deepseek-chat",
  nvidia: "meta-llama-3.1-405b-instruct",
};

const getProvider = (): ProviderId => {
  const fromEnv = process.env.SOPHIA_DEFAULT_PROVIDER as ProviderId | undefined;
  if (fromEnv === "anthropic" || fromEnv === "openai" || fromEnv === "google" || fromEnv === "deepseek" || fromEnv === "nvidia")
    return fromEnv;
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GOOGLE_AI_API_KEY) return "google";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  if (process.env.NVIDIA_API_KEY) return "nvidia";
  throw new Error(
    "No AI provider configured: set ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_AI_API_KEY, DEEPSEEK_API_KEY, or NVIDIA_API_KEY"
  );
};

const listModels = (): Record<ProviderId, string[]> => ({
  anthropic: [
    "claude-3-5-sonnet-latest",
    "claude-3-5-haiku-latest",
    "claude-3-opus-latest",
  ],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
  google: ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  nvidia: ["meta-llama-3.1-405b-instruct", "meta-llama-3.1-70b-instruct", "meta-llama-3.1-8b-instruct"],
});

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
) {
  const provider = options.provider ?? getProvider();
  const model = options.model ?? DEFAULT_MODELS[provider];
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 1024;

  if (provider === "anthropic") {
    return chatAnthropic(messages, {
      model,
      temperature,
      maxTokens,
      system: options.system,
    });
  }
  if (provider === "google") {
    return chatGoogle(messages, {
      model,
      temperature,
      maxTokens,
      system: options.system,
    });
  }
  if (provider === "deepseek") {
    return chatDeepSeek(messages, {
      model,
      temperature,
      maxTokens,
      system: options.system,
    });
  }
  if (provider === "nvidia") {
    return chatNvidia(messages, {
      model,
      temperature,
      maxTokens,
      system: options.system,
    });
  }
  return chatOpenAI(messages, {
    model,
    temperature,
    maxTokens,
    system: options.system,
  });
}

async function chatAnthropic(
  messages: ChatMessage[],
  opts: {
    model: string;
    temperature: number;
    maxTokens: number;
    system?: string;
  }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });

  const filtered = messages.filter((m) => m.role !== "system");
  const systemPrompt =
    opts.system ?? messages.find((m) => m.role === "system")?.content;

  const response = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
    system: systemPrompt,
    messages: filtered.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return {
    provider: "anthropic" as const,
    model: opts.model,
    content: text,
    usage: response.usage,
  };
}

async function chatOpenAI(
  messages: ChatMessage[],
  opts: {
    model: string;
    temperature: number;
    maxTokens: number;
    system?: string;
  }
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const client = new OpenAI({ apiKey });
  const finalMessages: ChatMessage[] = opts.system
    ? [{ role: "system", content: opts.system }, ...messages]
    : messages;

  const response = await client.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    messages: finalMessages,
  });

  return {
    provider: "openai" as const,
    model: opts.model,
    content: response.choices[0]?.message?.content ?? "",
    usage: response.usage,
  };
}

async function chatGoogle(
  messages: ChatMessage[],
  opts: {
    model: string;
    temperature: number;
    maxTokens: number;
    system?: string;
  }
) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  const systemPrompt =
    opts.system ?? messages.find((m) => m.role === "system")?.content;

  const genModel = genAI.getGenerativeModel({
    model: opts.model,
    systemInstruction: systemPrompt || undefined,
  });

  const history = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

  const lastMessage = history.pop();
  if (!lastMessage) throw new Error("No messages to send");

  const chatSession = genModel.startChat({
    history,
    generationConfig: {
      temperature: opts.temperature,
      maxOutputTokens: opts.maxTokens,
    },
  });

  const result = await chatSession.sendMessage(lastMessage.parts);
  const response = result.response;

  return {
    provider: "google" as const,
    model: opts.model,
    content: response.text(),
    usage: {
      prompt_tokens: response.usageMetadata?.promptTokenCount ?? 0,
      completion_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      total_tokens: response.usageMetadata?.totalTokenCount ?? 0,
    },
  };
}

async function chatDeepSeek(
  messages: ChatMessage[],
  opts: {
    model: string;
    temperature: number;
    maxTokens: number;
    system?: string;
  }
) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

  const finalMessages: ChatMessage[] = opts.system
    ? [{ role: "system", content: opts.system }, ...messages]
    : messages;

  const response = await client.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    messages: finalMessages,
  });

  return {
    provider: "deepseek" as const,
    model: opts.model,
    content: response.choices[0]?.message?.content ?? "",
    usage: response.usage,
  };
}

async function chatNvidia(
  messages: ChatMessage[],
  opts: {
    model: string;
    temperature: number;
    maxTokens: number;
    system?: string;
  }
) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const client = new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  const finalMessages: ChatMessage[] = opts.system
    ? [{ role: "system", content: opts.system }, ...messages]
    : messages;

  const response = await client.chat.completions.create({
    model: opts.model,
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    messages: finalMessages,
  });

  return {
    provider: "nvidia" as const,
    model: opts.model,
    content: response.choices[0]?.message?.content ?? "",
    usage: response.usage,
  };
}

export const ModelRouter = {
  chat,
  getProvider,
  listModels,
};
