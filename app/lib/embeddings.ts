export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

// Simple paragraph-based chunker with a soft cap on characters.
// Not token-perfect but works fine for text-embedding-3-small's 8k context.
export function chunkContent(content: string, maxChars = 1500): string[] {
  if (!content.trim()) return []

  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''

  for (const p of paragraphs) {
    if (p.length >= maxChars) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      for (let i = 0; i < p.length; i += maxChars) {
        chunks.push(p.slice(i, i + maxChars))
      }
      continue
    }
    if ((current + '\n\n' + p).length > maxChars) {
      chunks.push(current)
      current = p
    } else {
      current = current ? `${current}\n\n${p}` : p
    }
  }
  if (current) chunks.push(current)
  return chunks
}

export async function embedTexts(
  apiKey: string,
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return []

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI embeddings error (${res.status}): ${err}`)
  }

  const json = (await res.json()) as { data: { embedding: number[] }[] }
  return json.data.map((d) => d.embedding)
}
