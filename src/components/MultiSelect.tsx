import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[] | string[]
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

  const normalizedOptions: MultiSelectOption[] = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  )

  const selectedLabels = normalizedOptions
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label)
  const label =
    selectedLabels.length > 0
      ? selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels.length} selecionado(s)`
      : placeholder

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
          {normalizedOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => toggle(option.value)}
              className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer text-sm text-foreground dark:text-slate-100"
            >
              <div
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded border',
                  selected.includes(option.value) ? 'bg-primary border-primary' : 'border-input',
                )}
              >
                {selected.includes(option.value) && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
