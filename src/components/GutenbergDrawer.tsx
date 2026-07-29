import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Loader2, Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { useGutenbergChatStore, sendGutenbergMessage, clearChat } from '@/stores/gutenberg-chat'

interface GutenbergDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function GutenbergDrawer({ isOpen, onClose }: GutenbergDrawerProps) {
  const { messages, isLoading, error } = useGutenbergChatStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendGutenbergMessage(text)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] sm:w-[400px] h-[520px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up">
        <div className="p-4 border-b border-border bg-[#0B0E14] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                Gutenberg AI <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300">Inteligência Operacional BKO</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8"
              title="Limpar Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

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
                  {m.sender === 'bot' ? (
                    m.text ? (
                      <MarkdownRenderer content={m.text} />
                    ) : (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Pensando...
                      </span>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
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
    </>
  )
}
