import { useState, useRef, useEffect, useMemo } from 'react'
import { Bot, Send, X, Loader2, Sparkles, AlertCircle, Plus, History, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface GutenbergDrawerProps {
  isOpen: boolean
  onClose: () => void
  buttonPosition?: { x: number; y: number }
}

export function GutenbergDrawer({ isOpen, onClose, buttonPosition }: GutenbergDrawerProps) {
  const { user } = useAuth()
  const { messages, isLoading, error, specialties, conversations, conversationId } =
    useGutenbergChatStore()

  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (!isOpen) return
    loadConversations()
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const drawerStyle = useMemo(() => {
    if (!buttonPosition) return undefined
    const btnSize = 56
    const gap = 16
    const vw = window.innerWidth
    const vh = window.innerHeight
    const dw = vw < 640 ? vw - 48 : 420
    const dh = Math.min(580, vh - 80)

    let left: number
    if (buttonPosition.x + btnSize / 2 > vw / 2) {
      left = buttonPosition.x + btnSize - dw
    } else {
      left = buttonPosition.x
    }
    left = Math.max(12, Math.min(left, vw - dw - 12))

    let top: number
    if (buttonPosition.y + btnSize / 2 > vh / 2) {
      top = buttonPosition.y - gap - dh
    } else {
      top = buttonPosition.y + btnSize + gap
    }
    top = Math.max(12, Math.min(top, vh - dh - 12))

    return { left: `${left}px`, top: `${top}px` }
  }, [buttonPosition])

  if (!isOpen) return null

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input.trim()
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

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className="fixed w-[calc(100vw-3rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up"
        style={drawerStyle ?? { bottom: '6rem', right: '1.5rem' }}
      >
        <div className="p-3 border-b border-border bg-[#0B0E14] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs flex items-center gap-1">
                Gutenberg AI <Sparkles className="w-3 h-3 text-amber-400" />
              </h3>
              <p className="text-[10px] text-slate-300">Inteligência da Operação</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="text-slate-300 hover:text-white hover:bg-slate-800 h-7 w-7"
                title="Instruções de Contexto"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-7 w-7"
              title="Histórico"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                newChat()
                setShowHistory(false)
              }}
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-7 w-7"
              title="Novo Chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-7 w-7"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {showHistory ? (
          <ChatHistorySidebar
            conversations={conversations}
            activeId={conversationId}
            onSelect={async (id) => {
              await loadConversation(id)
              setShowHistory(false)
            }}
            onNewChat={() => {
              newChat()
              setShowHistory(false)
            }}
            onClose={() => setShowHistory(false)}
            className="flex-1"
          />
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-muted/20 flex-wrap">
              {SPECIALTIES.map((s) => (
                <label key={s.value} className="flex items-center gap-1 cursor-pointer">
                  <Checkbox
                    checked={specialties.includes(s.value)}
                    onCheckedChange={() => toggleSpecialty(s.value)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-[10px] text-muted-foreground dark:text-slate-400">
                    {s.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex-1 p-3 overflow-y-auto" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none border border-border'
                      }`}
                    >
                      {m.sender === 'bot' ? (
                        m.text ? (
                          <MarkdownRenderer content={m.text} />
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> Pensando...
                          </span>
                        )
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && !messages.find((m) => m.sender === 'bot' && !m.text) && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground p-1">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> Consultando...
                  </div>
                )}
                {error && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-[10px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                  </div>
                )}
              </div>
            </div>

            <div className="p-2 border-t border-border bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-1.5"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte sobre procedimentos..."
                  className="flex-1 text-xs h-9 bg-muted/50 border-border"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 h-9 w-9"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      <GutenbergSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
