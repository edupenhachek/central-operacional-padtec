import { useState, useEffect } from 'react'
import { format, subMinutes, subHours, subDays, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimeSelector } from '@/components/transbordo/TimeSelector'

export interface DateTimeRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateTimeRangePickerProps {
  value: DateTimeRange | undefined
  onChange: (value: DateTimeRange | undefined) => void
}

const SHORTCUTS: { label: string; getRange: () => DateTimeRange }[] = [
  {
    label: 'Últimos 30 minutos',
    getRange: () => ({ from: subMinutes(new Date(), 30), to: new Date() }),
  },
  { label: 'Última hora', getRange: () => ({ from: subHours(new Date(), 1), to: new Date() }) },
  {
    label: 'Últimas 12 horas',
    getRange: () => ({ from: subHours(new Date(), 12), to: new Date() }),
  },
  {
    label: 'Últimas 24 horas',
    getRange: () => ({ from: subHours(new Date(), 24), to: new Date() }),
  },
  { label: 'Última semana', getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Último mês', getRange: () => ({ from: subMonths(new Date(), 1), to: new Date() }) },
  { label: 'Outro intervalo', getRange: () => ({ from: undefined, to: undefined }) },
]

export function DateTimeRangePicker({ value, onChange }: DateTimeRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateTimeRange>(value || { from: undefined, to: undefined })

  useEffect(() => {
    if (open) setDraft(value || { from: undefined, to: undefined })
  }, [open, value])

  const hasRange = value?.from || value?.to
  const fmt = (d: Date) => format(d, 'dd-MM-yyyy HH:mm:ss')
  const displayText = hasRange
    ? value?.from && value?.to
      ? `${fmt(value.from)} — ${fmt(value.to)}`
      : value?.from
        ? `${fmt(value.from)} — ...`
        : `... — ${fmt(value.to!)}`
    : 'Selecionar período'

  const handleShortcut = (getRange: () => DateTimeRange) => setDraft(getRange())

  const handleCalendarSelect = (sel: { from?: Date; to?: Date } | undefined) => {
    if (!sel) {
      setDraft({ from: undefined, to: undefined })
      return
    }
    const from = sel.from ? new Date(sel.from) : undefined
    const to = sel.to ? new Date(sel.to) : undefined
    if (from) {
      from.setHours(
        draft.from?.getHours() ?? 0,
        draft.from?.getMinutes() ?? 0,
        draft.from?.getSeconds() ?? 0,
      )
    }
    if (to) {
      to.setHours(
        draft.to?.getHours() ?? 23,
        draft.to?.getMinutes() ?? 59,
        draft.to?.getSeconds() ?? 59,
      )
    }
    setDraft({ from, to })
  }

  const updateTime = (
    target: 'from' | 'to',
    field: 'hours' | 'minutes' | 'seconds',
    val: number,
  ) => {
    setDraft((prev) => {
      const base = prev[target] ? new Date(prev[target]!) : new Date()
      if (field === 'hours') base.setHours(val)
      else if (field === 'minutes') base.setMinutes(val)
      else base.setSeconds(val)
      return { ...prev, [target]: base }
    })
  }

  const handleApply = () => {
    onChange(draft)
    setOpen(false)
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 flex-1 text-xs justify-start font-normal bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          >
            <CalendarIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r border-slate-200 dark:border-slate-800 p-2 min-w-[160px]">
              {SHORTCUTS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleShortcut(s.getRange)}
                  className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="p-3">
              <Calendar
                mode="range"
                selected={draft.from ? { from: draft.from, to: draft.to } : undefined}
                onSelect={handleCalendarSelect}
                locale={ptBR}
                numberOfMonths={2}
              />
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Início:
                </span>
                <TimeSelector
                  hours={draft.from?.getHours() ?? 0}
                  minutes={draft.from?.getMinutes() ?? 0}
                  seconds={draft.from?.getSeconds() ?? 0}
                  onChange={(f, v) => updateTime('from', f, v)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Fim:</span>
                <TimeSelector
                  hours={draft.to?.getHours() ?? 23}
                  minutes={draft.to?.getMinutes() ?? 59}
                  seconds={draft.to?.getSeconds() ?? 59}
                  onChange={(f, v) => updateTime('to', f, v)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleApply}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {hasRange && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(undefined)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  )
}
