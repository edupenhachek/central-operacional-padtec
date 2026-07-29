import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Bot, Send, CheckCircle2, User, Trophy, Clock } from 'lucide-react'
import { sendSimulatorMessage } from '@/services/training'
import { FinalExamModal } from './FinalExamModal'

interface ChatSimulatorModuleProps {
  unlocked: boolean
  onComplete: () => void
}

const PERSONAS = [
  {
    id: 'Vinicius',
    name: 'Vinícius',
    role: 'NOC Estressado / Urgente',
    badge: 'Difícil',
    badgeCls: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    initialMsg:
      'Preciso da validação da OLT GPON e CTO 14 IMEDIATAMENTE! O circuito está caindo e a cliente está ligando sem parar. Me passe o status agora!',
  },
  {
    id: 'Osmar',
    name: 'Osmar',
    role: 'Técnico de Campo Detalhista',
    badge: 'Médio (Delay)',
    badgeCls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    initialMsg:
      'Olá, bom dia! Estou no local da caixa de atendimento CTO 08. Medi o nível de sinal óptico em -19.2 dBm. Pode confirmar no sistema se o batimento confere?',
  },
  {
    id: 'Junior',
    name: 'Junior',
    role: 'Operador BKO Colaborativo',
    badge: 'Fácil',
    badgeCls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    initialMsg:
      'Oi, tudo bem? Estou realizando o cadastro de um novo assinante e fiquei na dúvida sobre a regra do Batimento de Caixa. Pode me ajudar?',
  },
]

export function ChatSimulatorModule({ unlocked, onComplete }: ChatSimulatorModuleProps) {
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(0)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [typingTimer, setTypingTimer] = useState<number | null>(null)
  const [completedPersonas, setCompletedPersonas] = useState<string[]>([])
  const [examOpen, setExamOpen] = useState(false)

  const activePersona = PERSONAS[selectedPersonaIdx]

  useEffect(() => {
    setMessages([{ role: 'assistant', content: activePersona.initialMsg }])
  }, [selectedPersonaIdx])

  if (!unlocked) {
    return (
      <Card className="border-border shadow-sm p-8 text-center bg-card">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-bold text-base text-foreground">Simulador Bloqueado</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Conclua todos os quizzes do Knowledge Hub para liberar as simulações práticas de
          atendimento.
        </p>
      </Card>
    )
  }

  const handleSend = async () => {
    if (!inputText.trim() || loading) return
    const userMsg = inputText.trim()
    setInputText('')

    const updatedHistory = [...messages, { role: 'user', content: userMsg }]
    setMessages(updatedHistory)
    setLoading(true)

    if (activePersona.id === 'Osmar') {
      setTypingTimer(3)
      const interval = setInterval(() => {
        setTypingTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            return null
          }
          return prev - 1
        })
      }, 1000)
    }

    try {
      const res = await sendSimulatorMessage(activePersona.id, userMsg, messages)
      setTimeout(
        () => {
          setMessages((prev) => [...prev, { role: 'assistant', content: res.content }])
          setLoading(false)
        },
        activePersona.id === 'Osmar' ? 3000 : 800,
      )
    } catch {
      setLoading(false)
    }
  }

  const finishPersona = () => {
    if (!completedPersonas.includes(activePersona.id)) {
      const updated = [...completedPersonas, activePersona.id]
      setCompletedPersonas(updated)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Simulador Prático com Personas AI</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atenda os 3 perfis operacionais e realize o Exame Final para obter a certificação.
          </p>
        </div>
        {completedPersonas.length === 3 ? (
          <Button
            onClick={() => setExamOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 shadow-md"
          >
            <Trophy className="w-4 h-4 mr-1.5" /> Iniciar Exame Final
          </Button>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">
            {completedPersonas.length} / 3 Personas Concluídas
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PERSONAS.map((p, idx) => {
          const isDone = completedPersonas.includes(p.id)
          const isSelected = selectedPersonaIdx === idx
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersonaIdx(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all ${isSelected ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30' : 'border-border bg-card'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badgeCls}`}>
                  {p.badge}
                </span>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="font-bold text-sm text-foreground mt-2">{p.name}</p>
              <p className="text-[11px] text-muted-foreground">{p.role}</p>
            </button>
          )
        })}
      </div>

      <Card className="border-border shadow-sm bg-card flex flex-col h-[420px]">
        <CardHeader className="p-3.5 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                {activePersona.name}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">{activePersona.role}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={finishPersona} className="text-xs h-8">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Finalizar Atendimento
          </Button>
        </CardHeader>

        <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role !== 'user' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {activePersona.name[0]}
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-foreground rounded-bl-none'}`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {typingTimer !== null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-500" /> Osmar está digitando (
              {typingTimer}s)...
            </div>
          )}
        </CardContent>

        <div className="p-3 border-t border-border flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Responder a ${activePersona.name}...`}
            className="text-xs h-9"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>

      <FinalExamModal open={examOpen} onClose={() => setExamOpen(false)} onPass={onComplete} />
    </div>
  )
}
