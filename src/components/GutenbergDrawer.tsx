import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { askGutenbergStream } from '@/services/gutenberg'
import { AgentCitation } from '@/lib/skipAi'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  citations?: AgentCitation[]
}

interface GutenbergDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function GutenbergDrawer({ isOpen, onClose }: GutenbergDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Olá! Sou o **Gutenberg**, seu assistente operacional Padtec. Como posso te ajudar hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  if (!isOpen) return null

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userText = input.trim()
    setInput('')
    setError(null)

    const userMsgId = Date.now().toString()
    const botMsgId = (Date.now() + 1).toString()

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: userText },
      { id: botMsgId, sender: 'bot', text: '' },
    ])

    setIsLoading(true)

    try {
      const res = await askGutenbergStream({
        message: userText,
        conversationId,
        onChunk: (_chunk, accumulated) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === botMsgId ? { ...msg, text: accumulated } : msg)),
          )
        },
        onCitations: (citations) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === botMsgId ? { ...msg, citations } : msg)),
          )
        },
      })

      if (res.conversationId) setConversationId(res.conversationId)
    } catch (err: any) {
      setError(err.message || 'Erro ao obter resposta do Gutenberg')
      setMessages((prev) => prev.filter((m) => m.id !== botMsgId))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="p-4 border-b border-border bg-[#0B0E14] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              Gutenberg AI <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-300">Inteligência Operacional BKO</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-muted text-foreground rounded-bl-none border border-border'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {m.text || (isLoading && m.sender === 'bot' ? 'Pensando...' : '')}
                </p>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="font-semibold">Fontes:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {m.citations.map((c, i) => (
                        <li key={i} className="truncate" title={c.excerpt}>
                          {c.excerpt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Consultando base de dados
              Gutenberg...
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-border bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre procedimentos..."
            className="flex-1 text-sm bg-muted/50 border-border"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
