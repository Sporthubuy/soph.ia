import { createClient } from '../../../../lib/supabase/server'
import { fetchCurrentProfile } from '../../../../lib/profile'
import { decrypt } from '../../../../lib/crypto'
import { getProviderForModel } from '../../../../lib/providers'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type ModelParams = { maxTokens: number; temperature: number }

async function streamAnthropic(apiKey: string, model: string, messages: ChatMessage[], systemPrompt: string, params: ModelParams) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Tu API key de Anthropic es inválida. Actualizala en Configuración > API Keys.')
    const err = await res.text()
    throw new Error(`Error de Anthropic (${res.status}): ${err}`)
  }
  return res.body
}

async function streamOpenAI(apiKey: string, model: string, messages: ChatMessage[], systemPrompt: string, params: ModelParams) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
    }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Tu API key de OpenAI es inválida. Actualizala en Configuración > API Keys.')
    const err = await res.text()
    throw new Error(`Error de OpenAI (${res.status}): ${err}`)
  }
  return res.body
}

async function streamGoogle(apiKey: string, model: string, messages: ChatMessage[], systemPrompt: string, params: ModelParams) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: params.maxTokens, temperature: params.temperature },
      }),
    }
  )

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('Tu API key de Google AI es inválida. Actualizala en Configuración > API Keys.')
    const err = await res.text()
    throw new Error(`Error de Google AI (${res.status}): ${err}`)
  }
  return res.body
}

function createSSEStream(
  upstreamBody: ReadableStream<Uint8Array>,
  provider: string
): ReadableStream {
  const decoder = new TextDecoder()
  let buffer = ''

  return new ReadableStream({
    async start(controller) {
      const reader = upstreamBody.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            controller.close()
            return
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              controller.close()
              return
            }

            try {
              const json = JSON.parse(payload)
              let text = ''

              if (provider === 'anthropic') {
                if (json.type === 'content_block_delta' && json.delta?.text) {
                  text = json.delta.text
                }
              } else if (provider === 'openai') {
                text = json.choices?.[0]?.delta?.content ?? ''
              } else if (provider === 'google') {
                text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
              }

              if (text) {
                const sseData = JSON.stringify({ text })
                controller.enqueue(new TextEncoder().encode(`data: ${sseData}\n\n`))
              }
            } catch {
              // skip unparseable chunks
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
        controller.close()
      }
    },
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const supabase = await createClient()
    const profile = await fetchCurrentProfile(supabase)
    if (!profile) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { messages } = (await request.json()) as { messages: ChatMessage[] }
    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'No messages' }), { status: 400 })
    }

    const { data: agent, error: agentErr } = await supabase
      .from('agents')
      .select('id, name, description, model, type, prompt, restrict_to_kus, temperature, max_tokens, usage_count')
      .eq('id', agentId)
      .single()

    if (agentErr || !agent) {
      return new Response(JSON.stringify({ error: 'Agente no encontrado' }), { status: 404 })
    }

    const provider = getProviderForModel(agent.model)
    if (!provider) {
      return new Response(JSON.stringify({ error: `Modelo ${agent.model} no reconocido` }), { status: 400 })
    }

    const { data: keyRow, error: keyErr } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('profile_id', profile.id)
      .eq('provider', provider)
      .single()

    if (keyErr || !keyRow) {
      return new Response(
        JSON.stringify({ error: `No tenés configurada una API key de ${provider}. Andá a Configuración > API Keys.` }),
        { status: 400 }
      )
    }

    const apiKey = decrypt(keyRow.encrypted_key)

    const { data: kuLinks } = await supabase
      .from('agents_knowledge_units')
      .select('knowledge_unit_id')
      .eq('agent_id', agentId)

    const kuIds = (kuLinks ?? []).map((row) => row.knowledge_unit_id)
    let kuContext = ''
    if (kuIds.length > 0) {
      const { data: kus } = await supabase
        .from('knowledge_units')
        .select('name, type, area, content')
        .in('id', kuIds)

      if (kus && kus.length > 0) {
        kuContext = kus
          .map((ku) => {
            const header = `### ${ku.name} (${ku.type} · ${ku.area})`
            const body = (ku.content as string | null)?.trim() || '(sin contenido)'
            return `${header}\n${body}`
          })
          .join('\n\n---\n\n')
      }
    }

    const systemParts: string[] = []
    if (agent.prompt?.trim()) {
      systemParts.push(agent.prompt.trim())
    } else {
      systemParts.push(`Sos "${agent.name}", un agente de tipo ${agent.type} en Soph.ia.`)
      if (agent.description) systemParts.push(`Tu propósito: ${agent.description}`)
      systemParts.push('Respondé de forma clara, concisa y profesional. Usá español rioplatense.')
    }

    if (kuContext) {
      systemParts.push(
        `\n---\nContexto disponible (Knowledge Units asignadas por el usuario). Usalo cuando sea relevante:\n\n${kuContext}`
      )
      if (agent.restrict_to_kus) {
        systemParts.push(
          '\nIMPORTANTE: solo podés responder usando la información del contexto de arriba. Si la pregunta no puede responderse con ese contexto, decí honestamente que no tenés esa información en tus fuentes.'
        )
      }
    } else if (agent.restrict_to_kus) {
      systemParts.push(
        '\nIMPORTANTE: este agente está configurado para responder solo con Knowledge Units, pero no tiene ninguna asignada. Aclaralo al usuario y pedile que asigne KUs desde la edición del agente.'
      )
    }

    const systemPrompt = systemParts.join(' ')

    const params: ModelParams = {
      maxTokens: typeof agent.max_tokens === 'number' ? agent.max_tokens : 4096,
      temperature: typeof agent.temperature === 'number' ? agent.temperature : 0.7,
    }

    let upstreamBody: ReadableStream<Uint8Array> | null = null

    if (provider === 'anthropic') {
      upstreamBody = await streamAnthropic(apiKey, agent.model, messages, systemPrompt, params)
    } else if (provider === 'openai') {
      upstreamBody = await streamOpenAI(apiKey, agent.model, messages, systemPrompt, params)
    } else if (provider === 'google') {
      upstreamBody = await streamGoogle(apiKey, agent.model, messages, systemPrompt, params)
    }

    if (!upstreamBody) {
      return new Response(JSON.stringify({ error: 'Provider no soportado' }), { status: 400 })
    }

    await supabase
      .from('agents')
      .update({ usage_count: (agent.usage_count ?? 0) + 1 })
      .eq('id', agentId)

    const stream = createSSEStream(upstreamBody, provider)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
