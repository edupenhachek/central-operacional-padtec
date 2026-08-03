import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINS = Array.from({ length: 60 }, (_, i) => i)

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

interface TimeSelectorProps {
  hours: number
  minutes: number
  seconds: number
  onChange: (field: 'hours' | 'minutes' | 'seconds', value: number) => void
}

export function TimeSelector({ hours, minutes, seconds, onChange }: TimeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Select value={String(hours)} onValueChange={(v) => onChange('hours', Number(v))}>
        <SelectTrigger className="w-[48px] h-7 text-xs px-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {HOURS.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {pad(h)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-[11px] text-slate-400">:</span>
      <Select value={String(minutes)} onValueChange={(v) => onChange('minutes', Number(v))}>
        <SelectTrigger className="w-[48px] h-7 text-xs px-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {MINS.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {pad(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-[11px] text-slate-400">:</span>
      <Select value={String(seconds)} onValueChange={(v) => onChange('seconds', Number(v))}>
        <SelectTrigger className="w-[48px] h-7 text-xs px-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {MINS.map((s) => (
            <SelectItem key={s} value={String(s)}>
              {pad(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
