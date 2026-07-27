import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { useGutenbergChatStore, sendGutenbergMessage } from '@/stores/gutenberg-chat'

export default function GutenbergChat() {
  const { messages, isLoading, error } = useGutenbergChatStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendGutenbergMessage(text)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col border border-border rounded-xl bg-card shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border bg-[#0B0E14] text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-base flex items-center gap-2">
            Módulo Gutenberg AI <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300">Central de Inteligência da Operação</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4" ref={scrollRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-muted text-foreground rounded-bl-none border border-border'
              }`}
            >
              {m.sender === 'bot' ? (
                m.text ? (
                  <MarkdownRenderer content={m.text} />
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processando resposta...
                  </span>
                )
              ) : (
                <p className="whitespace-pre-wrap">{m.text}</p>
              )}
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
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida operacional ou solicite ajuda em procedimentos..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            <Send className="w-4 h-4 mr-1.5" /> Enviar
          </Button>
        </form>
      </div>
    </div>
  )
}
