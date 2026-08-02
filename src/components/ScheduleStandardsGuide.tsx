import { ScrollText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const STANDARDS = [
  {
    name: 'Fixo (5x2 Padrão)',
    desc: 'Segunda a sexta-feira como dias de trabalho. Sábado e domingo como folga.',
  },
  {
    name: 'COPE 3S (3 Semanas / 21 dias)',
    desc: 'Ciclo rotativo de 21 dias com 3 semanas (A, B, C) que se repetem:',
    weeks: [
      { name: 'Semana A', detail: 'Seg=Trabalho, Ter=Folga, Qua–Sex=Trabalho, Sáb–Dom=Folga' },
      {
        name: 'Semana B',
        detail: 'Seg–Ter=Trabalho, Qua=Folga, Qui–Dom=Trabalho (inclui fim de semana)',
      },
      { name: 'Semana C', detail: 'Seg=Folga, Ter–Qua=Trabalho, Qui=Folga, Sex–Dom=Trabalho' },
    ],
    note: 'Após a Semana C, a Semana A reinicia. As folgas de Terça (A) e Segunda (C) funcionam como "transbordo" da semana anterior.',
  },
  {
    name: 'Ponto Focal 2S (2 Semanas)',
    desc: 'Ciclo rotativo de 14 dias com 2 semanas alternadas:',
    weeks: [
      { name: 'Semana PF A', detail: 'Seg–Sex=Trabalho. Sáb e Dom=Folga.' },
      { name: 'Semana PF B', detail: 'Seg–Qui=Trabalho. Sex e Dom=Folga. (Sábado trabalhado)' },
    ],
  },
]

export function ScheduleStandardsGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <ScrollText className="w-3.5 h-3.5" /> Padrão de Escalas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">Padrões de Escala Operacionais</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {STANDARDS.map((std) => (
            <div key={std.name} className="space-y-1.5">
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{std.name}</p>
              <p className="text-xs text-muted-foreground">{std.desc}</p>
              {std.weeks?.map((w) => (
                <div key={w.name} className="pl-3">
                  <span className="text-xs font-semibold">{w.name}: </span>
                  <span className="text-xs text-muted-foreground">{w.detail}</span>
                </div>
              ))}
              {std.note && (
                <p className="text-[11px] italic text-amber-600 dark:text-amber-400 pl-3">
                  {std.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
