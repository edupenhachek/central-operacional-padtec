import { useSyncExternalStore } from 'react'
import { askGutenbergStream } from '@/services/gutenberg'
import type { AgentCitation } from '@/lib/skipAi'

export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  citations?: AgentCitation[]
}

interface GutenbergChatState {
  conversationId: string | null
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'bot',
  text: 'Olá! Sou o **Gutenberg AI**, o núcleo de inteligência da Central Operacional. Como posso ajudar nas suas rotinas de BKO, NOC ou COPE hoje?',
}

let state: GutenbergChatState = {
  conversationId: null,
  messages: [WELCOME_MESSAGE],
  isLoading: false,
  error: null,
}

const listeners = new Set<() => void>()

function setState(updates: Partial<GutenbergChatState>) {
  state = { ...state, ...updates }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

export function useGutenbergChatStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export async function sendGutenbergMessage(text: string) {
  if (!text.trim() || state.isLoading) return

  const userText = text.trim()
  const userMsgId = Date.now().toString()
  const botMsgId = (Date.now() + 1).toString()

  setState({
    messages: [
      ...state.messages,
      { id: userMsgId, sender: 'user', text: userText },
      { id: botMsgId, sender: 'bot', text: '' },
    ],
    isLoading: true,
    error: null,
  })

  try {
    const res = await askGutenbergStream({
      message: userText,
      conversationId: state.conversationId,
      onChunk: (_chunk, accumulated) => {
        setState({
          messages: state.messages.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: accumulated } : msg,
          ),
        })
      },
      onCitations: (citations) => {
        setState({
          messages: state.messages.map((msg) =>
            msg.id === botMsgId ? { ...msg, citations } : msg,
          ),
        })
      },
    })

    if (res.conversationId) {
      setState({ conversationId: res.conversationId })
    }
  } catch (err: any) {
    setState({
      error: err.message || 'Erro ao obter resposta do Gutenberg',
      messages: state.messages.filter((m) => m.id !== botMsgId),
    })
  } finally {
    setState({ isLoading: false })
  }
}

export function clearGutenbergError() {
  setState({ error: null })
}

export default useGutenbergChatStore
