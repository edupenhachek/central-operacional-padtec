import { BookOpen } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const LEGEND_ITEMS = [
  {
    code: 'T1–T9',
    desc: 'Trabalho (turno específico)',
    bg: 'bg-emerald-500/25 dark:bg-emerald-500/30',
    text: 'text-emerald-950 dark:text-emerald-100',
  },
  {
    code: 'F',
    desc: 'Folga',
    bg: 'bg-red-500/25 dark:bg-red-500/30',
    text: 'text-red-950 dark:text-red-100',
  },
  {
    code: 'B',
    desc: 'Banco de Horas',
    bg: 'bg-yellow-200 dark:bg-yellow-900/70',
    text: 'text-yellow-950 dark:text-yellow-100',
  },
  {
    code: 'Férias',
    desc: 'Férias',
    bg: 'bg-purple-200 dark:bg-purple-900/70',
    text: 'text-purple-950 dark:text-purple-100',
  },
  {
    code: 'At',
    desc: 'Atestado',
    bg: 'bg-amber-200 dark:bg-amber-900/70',
    text: 'text-amber-950 dark:text-amber-100',
  },
  {
    code: 'Tr',
    desc: 'Treinamento',
    bg: 'bg-blue-200 dark:bg-blue-900/70',
    text: 'text-blue-950 dark:text-blue-100',
  },
  {
    code: 'FC',
    desc: 'Folga Compensatória',
    bg: 'bg-slate-200 dark:bg-slate-700/80',
    text: 'text-slate-950 dark:text-slate-100',
  },
]

export function EscalaLegend() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Legenda
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-xs font-bold mb-2">Legenda de Códigos</p>
        <div className="space-y-1.5">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.code} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-8 h-6 rounded text-[10px] font-bold ${item.bg} ${item.text}`}
              >
                {item.code}
              </span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
