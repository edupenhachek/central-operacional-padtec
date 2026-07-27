import { useState } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { askGutenbergStream } from '@/services/gutenberg'

export default function GutenbergChat() {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Olá! Sou a **Gutenberg AI**, o núcleo de inteligência da Central Operacional. Como posso ajudar nas suas rotinas de BKO, NOC ou COPE hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')

    setMessages((prev) => [...prev, { sender: 'user', text }, { sender: 'bot', text: '' }])

    setIsLoading(true)

    try {
      const res = await askGutenbergStream({
        message: text,
        conversationId,
        onChunk: (_chunk, accumulated) => {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { sender: 'bot', text: accumulated }
            return updated
          })
        },
      })
      if (res.conversationId) setConversationId(res.conversationId)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-muted text-foreground rounded-bl-none border border-border'
              }`}
            >
              {m.text || 'Processando resposta...'}
            </div>
          </div>
        ))}
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
