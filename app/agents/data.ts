export type AgentStatus = 'draft' | 'published' | 'archived'

export type Agent = {
  id: string
  name: string
  description: string | null
  type: string
  status: AgentStatus
  model: string
  version: number
  usage: number
  usageNote: string
  author: string
  tags: string[]
  created: string
  edited: string
  prompt?: string
  temperature?: number
  maxTokens?: number
}
