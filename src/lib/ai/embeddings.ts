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

interface SupabaseClient {
  rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

/** Semantic search using vector similarity via Supabase pgvector. */
export async function semanticSearch(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  limit = 10
) {
  try {
    // Use Supabase RPC to call search function
    const { data, error } = await supabase.rpc("search_agents_semantic", {
      query_embedding: queryEmbedding,
      limit_count: limit,
    });

    if (error) {
      console.error("Semantic search error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Semantic search failed:", error);
    return [];
  }
}

/** Calculate cosine similarity between two vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };