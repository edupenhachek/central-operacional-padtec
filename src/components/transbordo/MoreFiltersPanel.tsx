import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DateTimeRangePicker,
  type DateTimeRange,
} from '@/components/transbordo/DateTimeRangePicker'

interface AuthorOption {
  id: string
  name: string
}

interface MoreFiltersPanelProps {
  authorFilter: string
  onAuthorChange: (value: string) => void
  dateRange: DateTimeRange | undefined
  onDateRangeChange: (range: DateTimeRange | undefined) => void
  uniqueAuthors: AuthorOption[]
}

export function MoreFiltersPanel({
  authorFilter,
  onAuthorChange,
  dateRange,
  onDateRangeChange,
  uniqueAuthors,
}: MoreFiltersPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
      <div>
        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
          Quem publicou
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            list="transbordo-author-list"
            value={authorFilter}
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="Buscar por autor..."
            className="h-9 text-xs pl-8 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          <datalist id="transbordo-author-list">
            {uniqueAuthors.map((author) => (
              <option key={author.id} value={author.name} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
          Período da publicação
        </label>
        <DateTimeRangePicker value={dateRange} onChange={onDateRangeChange} />
      </div>
    </div>
  )
}
