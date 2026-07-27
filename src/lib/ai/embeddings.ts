import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export function truncateForEmbedding(text: string, maxChars = 8000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured for embeddings");
  }

  const client = new OpenAI({ apiKey });
  const input = truncateForEmbedding(text || " ");

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0]?.embedding ?? [];
}

export async function generateEmbeddingOrNull(
  text: string
): Promise<number[] | null> {
  try {
    return await generateEmbedding(text);
  } catch (e) {
    console.warn(
      "Embedding generation failed:",
      e instanceof Error ? e.message : e
    );
    return null;
  }
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };