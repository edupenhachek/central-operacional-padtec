import { useSyncExternalStore } from 'react'
import { askGutenbergStream, getGutenbergChats, getGutenbergMessages } from '@/services/gutenberg'
import { displayableMessages, type AgentCitation } from '@/lib/skipAi'

export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  citations?: AgentCitation[]
}

export interface Conversation {
  id: string
  title: string
  created: string
  updated: string
}

export const SPECIALTIES = [
  { value: 'NOC', label: 'Especialista NOC' },
  { value: 'COPE', label: 'Especialista COPE' },
  { value: 'BKO', label: 'Especialista BKO' },
  { value: 'Global', label: 'Visão Global' },
]

interface GutenbergChatState {
  conversationId: string | null
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  specialties: string[]
  conversations: Conversation[]
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'bot',
  text: 'Olá! Sou o **Gutenberg AI - Inteligência da Operação**. Como posso ajudar nas suas rotinas de BKO, NOC ou COPE hoje?',
}

function createInitialState(): GutenbergChatState {
  return {
    conversationId: null,
    messages: [WELCOME_MESSAGE],
    isLoading: false,
    error: null,
    specialties: ['NOC', 'COPE', 'BKO', 'Global'],
    conversations: [],
  }
}

let state: GutenbergChatState = createInitialState()
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

export function setSpecialties(specs: string[]) {
  setState({ specialties: specs })
}

export async function loadConversations() {
  try {
    const data = await getGutenbergChats()
    const convs: Conversation[] = Array.isArray(data)
      ? data.map((c: any) => ({
          id: c.id,
          title: c.title || 'Sem título',
          created: c.created || '',
          updated: c.updated || '',
        }))
      : []
    setState({ conversations: convs })
  } catch {
    /* intentionally ignored */
  }
}

export async function loadConversation(conversationId: string) {
  try {
    const data = await getGutenbergMessages(conversationId)
    const raw = Array.isArray(data) ? data : data?.messages || []
    const displayable = displayableMessages(raw)
    const chatMessages: ChatMessage[] = displayable.map((m) => ({
      id: m.id,
      sender: m.role === 'user' ? 'user' : 'bot',
      text: m.content,
      citations: m.citations,
    }))
    setState({
      conversationId,
      messages: chatMessages.length > 0 ? chatMessages : [WELCOME_MESSAGE],
      error: null,
    })
  } catch {
    setState({ error: 'Erro ao carregar conversa' })
  }
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
      specialties: state.specialties,
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
      error: err.message || 'Erro ao obter resposta do Gutenberg AI',
      messages: state.messages.filter((m) => m.id !== botMsgId),
    })
  } finally {
    setState({ isLoading: false })
  }
}

export function newChat() {
  setState({
    conversationId: null,
    messages: [WELCOME_MESSAGE],
    error: null,
  })
}

export function clearGutenbergError() {
  setState({ error: null })
}

export default useGutenbergChatStore
