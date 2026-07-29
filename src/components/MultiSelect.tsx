import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Selecionar',
  disabled,
}: MultiSelectProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const label = selected.length > 0 ? selected.join(', ') : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            'w-full h-10 text-sm font-normal justify-between bg-background dark:bg-slate-900/80 border-input',
            selected.length === 0 && 'text-muted-foreground dark:text-slate-400',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <div className="max-h-48 overflow-auto p-1">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggle(option)}
              className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer text-sm text-foreground dark:text-slate-100"
            >
              <div
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded border',
                  selected.includes(option) ? 'bg-primary border-primary' : 'border-input',
                )}
              >
                {selected.includes(option) && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span>{option}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
