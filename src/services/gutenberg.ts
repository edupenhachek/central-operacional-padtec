import pb from '@/lib/pocketbase/client'
import { streamAgentChat, AgentCitation } from '@/lib/skipAi'

export interface GutenbergSendOptions {
  message: string
  conversationId?: string | null
  signal?: AbortSignal
  onChunk?: (chunk: string, accumulated: string) => void
  onCitations?: (citations: AgentCitation[]) => void
}

export async function askGutenbergStream({
  message,
  conversationId,
  signal,
  onChunk,
  onCitations,
}: GutenbergSendOptions) {
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL || ''
  const response = await fetch(`${baseUrl}/backend/v1/gutenberg/ask-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId || null,
    }),
    signal,
  })

  const result = await streamAgentChat(response, {
    onChunk,
    onCitations,
    signal,
  })

  return {
    conversationId: response.headers.get('X-Conversation-Id') ?? result.conversation_id,
    content: result.content,
    citations: result.citations,
    messageId: result.message_id,
  }
}

export async function getGutenbergChats() {
  return pb.send('/backend/v1/gutenberg/chats', { method: 'GET' })
}

export async function getGutenbergMessages(conversationId: string) {
  return pb.send(`/backend/v1/gutenberg/chats/${conversationId}/messages`, { method: 'GET' })
}
