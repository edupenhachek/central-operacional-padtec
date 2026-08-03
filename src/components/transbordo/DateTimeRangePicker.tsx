import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface DateTimeRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateTimeRangePickerProps {
  value: DateTimeRange | undefined
  onChange: (value: DateTimeRange | undefined) => void
}

export function DateTimeRangePicker({ value, onChange }: DateTimeRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateTimeRange>(value || { from: undefined, to: undefined })

  useEffect(() => {
    if (open) setDraft(value || { from: undefined, to: undefined })
  }, [open, value])

  const hasRange = value?.from || value?.to
  const fmt = (d: Date) => format(d, 'dd-MM-yyyy')
  const displayText = hasRange
    ? value?.from && value?.to
      ? `${fmt(value.from)} — ${fmt(value.to)}`
      : value?.from
        ? `${fmt(value.from)} — ...`
        : `... — ${fmt(value.to!)}`
    : 'Selecionar período'

  const handleCalendarSelect = (sel: { from?: Date; to?: Date } | undefined) => {
    if (!sel || (!sel.from && !sel.to)) {
      setDraft({ from: undefined, to: undefined })
      return
    }
    const from = sel.from ? new Date(sel.from) : undefined
    const to = sel.to ? new Date(sel.to) : undefined
    setDraft({ from, to })
  }

  const handleApply = () => {
    const from = draft.from ? new Date(draft.from) : undefined
    const to = draft.to ? new Date(draft.to) : undefined
    if (from) from.setHours(0, 0, 0, 0)
    if (to) to.setHours(23, 59, 59, 999)
    onChange({ from, to })
    setOpen(false)
  }

  const handleClear = () => {
    setDraft({ from: undefined, to: undefined })
    onChange(undefined)
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
        <PopoverContent className="w-auto p-3" align="start">
          <Calendar
            mode="range"
            selected={draft.from ? { from: draft.from, to: draft.to } : undefined}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleClear}>
              Limpar
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleApply}
              disabled={!draft.from}
            >
              Filtrar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {hasRange && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => {
            onChange(undefined)
            setDraft({ from: undefined, to: undefined })
          }}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  )
}
