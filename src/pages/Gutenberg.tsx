import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Trash2, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { streamAgentChat, type AgentCitation } from '@/lib/skipAi'
import { useAuth } from '@/hooks/use-auth'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: AgentCitation[]
  created: string
}

export default function GutenbergPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o **Gutenberg AI**, assistente de inteligência e operação do BackOffice Padtec.\n\nComo posso ajudar você hoje? Você pode me perguntar sobre procedimentos operacionais, escalas, documentos ou treinamentos dos times NOC, COPE e BKO.',
      created: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    setInput('')
    const userMsgId = 'usr-' + Date.now()
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      created: new Date().toISOString(),
    }

    const assistantMsgId = 'ast-' + Date.now()
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      created: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ask-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token,
        },
        body: JSON.stringify({
          message: query,
          conversation_id: conversationId,
        }),
      })

      if (!res.ok) {
        const syncRes = await pb.send('/backend/v1/ask', {
          method: 'POST',
          body: JSON.stringify({ message: query, conversation_id: conversationId }),
          headers: { 'Content-Type': 'application/json' },
        })

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: syncRes.content || syncRes.text || 'Processado com sucesso.',
                  citations: syncRes.citations,
                }
              : m,
          ),
        )
        if (syncRes.conversation_id) setConversationId(syncRes.conversation_id)
        return
      }

      const streamResult = await streamAgentChat(res, {
        onChunk: (_chunk, accumulated) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m)),
          )
        },
        onCitations: (citations) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, citations } : m)),
          )
        },
      })

      if (streamResult.conversation_id) {
        setConversationId(streamResult.conversation_id)
      }
    } catch (err) {
      console.error('Error calling Gutenberg AI:', err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  m.content ||
                  'Desculpe, ocorreu uma falha na comunicação com o Gutenberg AI. Por favor, tente novamente.',
              }
            : m,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'Conversa reiniciada. Em que posso ser útil agora?',
        created: new Date().toISOString(),
      },
    ])
    setConversationId(null)
  }

  const quickPrompts = [
    'Qual a escala do time NOC para o turno da manhã?',
    'Como realizar o procedimento de batimento de caixa?',
    'Quais os contatos do focal do projeto COPE?',
    'Quais treinamentos são obrigatórios para BKO?',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
                Gutenberg AI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                Assistente Virtual
              </span>
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              Central de inteligência operacional para os projetos NOC, COPE e BKO.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground dark:border-slate-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Limpar conversa
        </Button>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col border-border bg-card dark:bg-slate-900 shadow-sm">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-muted/70 dark:bg-slate-800/80 text-foreground dark:text-slate-100 rounded-tl-none border border-border/50'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.content ||
                    (loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />)}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-[10px] uppercase tracking-wider">
                      Fontes de referência:
                    </p>
                    {msg.citations.map((c, i) => (
                      <div
                        key={i}
                        className="bg-background/50 p-1.5 rounded text-[10px] border border-border/30"
                      >
                        [{c.n}] {c.excerpt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-foreground dark:text-slate-100 flex items-center justify-center shrink-0 mt-1 font-bold text-xs shadow-sm">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-border/50 bg-muted/20 dark:bg-slate-900/50">
            <p className="text-[11px] font-medium text-muted-foreground dark:text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Sugestões de perguntas:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="text-[11px] bg-background dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 text-foreground dark:text-slate-200 px-3 py-1.5 rounded-full border border-border transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-border bg-card dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida ou comando para o Gutenberg..."
              disabled={loading}
              className="flex-1 h-10 px-4 rounded-lg bg-background dark:bg-slate-800 border border-input text-xs text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg gap-1.5 shrink-0"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Enviar
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
