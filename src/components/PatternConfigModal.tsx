import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPattern, updatePattern } from '@/services/padroes-escala'
import {
  DAY_KEYS,
  generateWeekName,
  type PatternConfig,
  type WeekConfig,
  type PadraoEscalaRecord,
} from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

const DAY_LABELS: Record<string, string> = {
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sáb',
  dom: 'Dom',
}

function createEmptyWeek(): WeekConfig {
  return { seg: 'T', ter: 'T', qua: 'T', qui: 'T', sex: 'T', sab: 'F', dom: 'F' }
}

function createEmptyConfig(weeks: number): PatternConfig {
  const config: PatternConfig = {}
  for (let i = 1; i <= weeks; i++) {
    const week = createEmptyWeek()
    week.nome = generateWeekName(i, week)
    week.nomeCustomizado = false
    config[`semana_${i}`] = week
  }
  return config
}

function regenerateNonCustomNames(config: PatternConfig): PatternConfig {
  const next: PatternConfig = {}
  const sortedKeys = Object.keys(config).sort((a, b) => {
    const na = parseInt(a.replace('semana_', ''), 10)
    const nb = parseInt(b.replace('semana_', ''), 10)
    return na - nb
  })
  let weekNum = 0
  for (const key of sortedKeys) {
    weekNum++
    const week = config[key]
    if (!week) continue
    if (week.nomeCustomizado) {
      next[key] = week
    } else {
      next[key] = {
        ...week,
        nome: generateWeekName(weekNum, week),
        nomeCustomizado: false,
      }
    }
  }
  return next
}

interface PatternConfigModalProps {
  open: boolean
  pattern?: PadraoEscalaRecord | null
  onClose: () => void
  onSaved: () => void
}

export function PatternConfigModal({ open, pattern, onClose, onSaved }: PatternConfigModalProps) {
  const [nome, setNome] = useState('')
  const [qtdSemanas, setQtdSemanas] = useState(1)
  const [config, setConfig] = useState<PatternConfig>(createEmptyConfig(1))
  const [loading, setLoading] = useState(false)
  const [activeWeek, setActiveWeek] = useState(1)

  useEffect(() => {
    if (open) {
      if (pattern) {
        setNome(pattern.nome)
        setQtdSemanas(pattern.qtd_semanas)
        const loadedConfig = pattern.configuracao
          ? { ...pattern.configuracao }
          : createEmptyConfig(pattern.qtd_semanas)
        setConfig(regenerateNonCustomNames(loadedConfig))
      } else {
        setNome('')
        setQtdSemanas(1)
        setConfig(createEmptyConfig(1))
      }
      setActiveWeek(1)
    }
  }, [open, pattern])

  const handleWeekCountChange = (val: string) => {
    const n = parseInt(val, 10)
    setQtdSemanas(n)
    setConfig((prev) => {
      const next: PatternConfig = {}
      for (let i = 1; i <= n; i++) {
        const existing = prev[`semana_${i}`]
        if (existing) {
          next[`semana_${i}`] = existing
        } else {
          const newWeek = createEmptyWeek()
          newWeek.nome = generateWeekName(i, newWeek)
          newWeek.nomeCustomizado = false
          next[`semana_${i}`] = newWeek
        }
      }
      return regenerateNonCustomNames(next)
    })
    if (activeWeek > n) setActiveWeek(n)
  }

  const toggleDay = (weekKey: string, dayKey: string) => {
    setConfig((prev) => {
      const week = prev[weekKey]
      if (!week) return prev
      const updatedWeek: WeekConfig = {
        ...week,
        [dayKey]: week[dayKey] === 'T' ? 'F' : 'T',
      }
      if (!updatedWeek.nomeCustomizado) {
        const weekNum = parseInt(weekKey.replace('semana_', ''), 10)
        updatedWeek.nome = generateWeekName(weekNum, updatedWeek)
      }
      return { ...prev, [weekKey]: updatedWeek }
    })
  }

  const handleWeekNameChange = (weekKey: string, value: string) => {
    setConfig((prev) => {
      const week = prev[weekKey]
      if (!week) return prev
      return {
        ...prev,
        [weekKey]: { ...week, nome: value, nomeCustomizado: true },
      }
    })
  }

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome do padrão.')
      return
    }
    if (qtdSemanas < 1 || qtdSemanas > 8) {
      toast.error('Quantidade de semanas inválida.')
      return
    }
    setLoading(true)
    try {
      const payload = { nome: nome.trim(), qtd_semanas: qtdSemanas, configuracao: config }
      if (pattern) {
        await updatePattern(pattern.id, payload)
        toast.success('Padrão atualizado!')
      } else {
        await createPattern(payload)
        toast.success('Padrão criado!')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao salvar padrão.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'h-10 text-sm bg-background dark:bg-slate-900/80 border-input'
  const weekKey = `semana_${activeWeek}`
  const week = config[weekKey]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {pattern ? 'Editar Padrão' : 'Novo Padrão'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nome do Padrão *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Rotativo BKO - 4 Semanas"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Quantidade de Semanas do Ciclo *</Label>
            <Select value={String(qtdSemanas)} onValueChange={handleWeekCountChange}>
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} Semana{n > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: qtdSemanas }, (_, i) => i + 1).map((w) => {
                const letter = String.fromCharCode(65 + w - 1)
                return (
                  <button
                    key={w}
                    onClick={() => setActiveWeek(w)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      activeWeek === w
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Semana {letter}
                  </button>
                )
              })}
            </div>
            {week && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nome da Semana</Label>
                  <Input
                    value={week.nome || ''}
                    onChange={(e) => handleWeekNameChange(weekKey, e.target.value)}
                    placeholder={generateWeekName(activeWeek, week)}
                    className={cn(inputCls, 'font-medium')}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {DAY_KEYS.map((dk) => (
                    <button
                      key={dk}
                      onClick={() => toggleDay(weekKey, dk)}
                      className={cn(
                        'flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-colors text-sm font-bold',
                        week[dk] === 'T'
                          ? 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-red-400 bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
                      )}
                    >
                      <span className="text-[10px] font-normal">{DAY_LABELS[dk]}</span>
                      <span>{week[dk]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
