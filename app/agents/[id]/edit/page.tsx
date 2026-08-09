'use client'

import { useParams } from 'next/navigation'
import { AgentBuilder } from '../../components/AgentBuilder'

export default function EditAgentPage() {
  const { id } = useParams<{ id: string }>()
  return <AgentBuilder agentId={id} />
}
