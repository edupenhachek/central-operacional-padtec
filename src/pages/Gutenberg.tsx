import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Plus, Sparkles, RefreshCw, Settings, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar'
import { GutenbergSettingsDialog } from '@/components/GutenbergSettingsDialog'
import {
  useGutenbergChatStore,
  sendGutenbergMessage,
  newChat,
  setSpecialties,
  loadConversations,
  loadConversation,
  SPECIALTIES,
} from '@/stores/gutenberg-chat'
import { useAuth } from '@/hooks/use-auth'

export default function GutenbergPage() {
  const { user } = useAuth()
  const { conversationId, messages, isLoading, error, specialties, conversations } =
    useGutenbergChatStore()

  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || isLoading) return
    setInput('')
    await sendGutenbergMessage(text)
    loadConversations()
  }

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter((s) => s !== spec))
    } else {
      setSpecialties([...specialties, spec])
    }
  }

  const quickPrompts = [
    'Qual a escala do time NOC para o turno da manhã?',
    'Como realizar o procedimento de batimento de caixa?',
    'Quais os contatos do focal do projeto COPE?',
    'Quais treinamentos são obrigatórios para BKO?',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] animate-fade-in space-y-3 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border shrink-0 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-slate-100">
                Gutenberg AI - Inteligência da Operação
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

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground dark:border-slate-800"
              title="Instruções de Contexto (System Prompt)"
            >
              <Settings className="w-3.5 h-3.5" />
              Instruções de Contexto
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground dark:border-slate-800"
          >
            <History className="w-3.5 h-3.5" />
            Histórico
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => newChat()}
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Chat
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 py-2 bg-card dark:bg-slate-900 border border-border rounded-xl text-xs flex-wrap shrink-0">
        <span className="font-semibold text-muted-foreground dark:text-slate-300">Bases RAG:</span>
        {SPECIALTIES.map((s) => (
          <label
            key={s.value}
            className="flex items-center gap-1.5 cursor-pointer bg-muted/40 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg hover:bg-muted/70 transition-colors"
          >
            <Checkbox
              checked={specialties.includes(s.value)}
              onCheckedChange={() => toggleSpecialty(s.value)}
              className="h-3.5 w-3.5"
            />
            <span className="text-xs font-medium text-foreground dark:text-slate-200">
              {s.label}
            </span>
          </label>
        ))}
      </div>

      <Card className="flex-1 overflow-hidden flex flex-row border-border bg-card dark:bg-slate-900 shadow-sm min-h-0">
        {showHistory && (
          <ChatHistorySidebar
            conversations={conversations}
            activeId={conversationId}
            onSelect={async (id) => {
              await loadConversation(id)
            }}
            onNewChat={() => newChat()}
            onClose={() => setShowHistory(false)}
            className="w-64 border-r border-border h-full shrink-0"
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-muted/70 dark:bg-slate-800/80 text-foreground dark:text-slate-100 rounded-tl-none border border-border/50'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {msg.text ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      isLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    )}
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

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-foreground dark:text-slate-100 flex items-center justify-center shrink-0 mt-1 font-bold text-xs shadow-sm">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 p-2 rounded bg-red-50 dark:bg-red-950/30">
                {error}
              </p>
            )}

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
                    disabled={isLoading}
                    className="text-[11px] bg-background dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 text-foreground dark:text-slate-200 px-3 py-1.5 rounded-full border border-border transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t border-border bg-card dark:bg-slate-900 shrink-0">
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
                placeholder="Digite sua dúvida ou comando para o Gutenberg AI..."
                disabled={isLoading}
                className="flex-1 h-10 px-4 rounded-lg bg-background dark:bg-slate-800 border border-input text-xs text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg gap-1.5 shrink-0"
              >
                {isLoading ? (
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
        </div>
      </Card>

      <GutenbergSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
