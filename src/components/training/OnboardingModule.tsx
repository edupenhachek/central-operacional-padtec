import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Play, CheckCircle2, ShieldCheck, Video, FileText } from 'lucide-react'

interface OnboardingModuleProps {
  onComplete: () => void
}

const CHECKLIST_ITEMS = [
  { id: 'c1', label: 'Teste e Calibração do Headset Operacional' },
  { id: 'c2', label: 'Configuração da VPN Padtec e Acesso Seguro' },
  { id: 'c3', label: 'Autenticação Múltipla (2FA) nos Sistemas Ops' },
  { id: 'c4', label: 'Homologação de Telas e Monitores Duplos' },
  { id: 'c5', label: 'Validação de Permissão e Perfil no Gutenberg' },
]

export function OnboardingModule({ onComplete }: OnboardingModuleProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: false,
    c4: false,
    c5: false,
  })
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    { title: '1. Introdução à Operação Padtec', duration: '12 min', type: 'Vídeo Institucional' },
    { title: '2. Arquitetura GPON & Equipamentos', duration: '25 min', type: 'Aula Teórica' },
    {
      title: '3. Procedimentos Integrados NOC/COPE/BKO',
      duration: '18 min',
      type: 'Manual Prático',
    },
  ]

  const total = CHECKLIST_ITEMS.length
  const completedCount = Object.values(checked).filter(Boolean).length
  const pct = Math.round((completedCount / total) * 100)

  const toggleItem = (id: string) => {
    const updated = { ...checked, [id]: !checked[id] }
    setChecked(updated)
    if (Object.values(updated).filter(Boolean).length === total) {
      onComplete()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video/Slide Player Container */}
      <Card className="border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-sm font-bold">Player de Imersão e Treinamento</CardTitle>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold px-2.5 py-0.5 rounded-full">
            Módulo 1
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center group">
            <div className="w-16 h-16 rounded-full bg-blue-600/90 group-hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-transform group-hover:scale-110 shadow-lg">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
            <h3 className="text-lg font-bold mt-4">{slides[activeSlide].title}</h3>
            <p className="text-xs text-slate-300 mt-1">
              {slides[activeSlide].type} • {slides[activeSlide].duration}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-card">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`p-3 text-left transition-colors hover:bg-muted/50 ${activeSlide === idx ? 'bg-muted font-bold text-blue-600' : 'text-muted-foreground'}`}
              >
                <p className="text-xs line-clamp-1">{s.title}</p>
                <p className="text-[10px] opacity-75 mt-0.5">{s.duration}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist de Configuração Obrigatoria */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base font-bold">
                Checklist de Configuração Obrigatória
              </CardTitle>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {completedCount} de {total} concluídos ({pct}%)
            </span>
          </div>
          <Progress value={pct} className="h-2 mt-3" />
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {CHECKLIST_ITEMS.map((item) => {
            const isDone = !!checked[item.id]
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isDone ? 'bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/20' : 'bg-card border-border hover:border-muted-foreground/30'}`}
              >
                <Checkbox checked={isDone} onCheckedChange={() => toggleItem(item.id)} />
                <span
                  className={`text-xs font-medium flex-1 ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                >
                  {item.label}
                </span>
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </div>
            )
          })}
          {pct === 100 && (
            <div className="pt-2">
              <Button
                onClick={onComplete}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10"
              >
                Módulo 1 Concluído! Desbloquear Knowledge Hub (+100 XP)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
