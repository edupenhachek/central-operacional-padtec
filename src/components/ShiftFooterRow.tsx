import { getShiftCountsPerDay } from '@/lib/collab-utils'
import { formatDateStr } from '@/lib/escala-utils'
import type { EscalaRecord } from '@/services/escalas'

interface ShiftFooterRowProps {
  escalas: EscalaRecord[]
  days: Date[]
}

export function ShiftFooterRow({ escalas, days }: ShiftFooterRowProps) {
  const counts = getShiftCountsPerDay(escalas, days)

  return (
    <tfoot className="bg-muted/50 dark:bg-slate-800/50 border-t-2 border-border">
      <tr>
        <th className="sticky left-0 z-20 bg-muted/50 dark:bg-slate-800/50 px-3 py-2 text-left text-xs font-semibold border-r border-border min-w-[180px]">
          Total/dia
        </th>
        {days.map((day) => {
          const dateStr = formatDateStr(day)
          const dayCounts = counts.get(dateStr) || {}
          const entries = Object.entries(dayCounts).filter(([, n]) => n > 0)
          return (
            <td
              key={dateStr}
              className="px-1 py-1.5 text-center border-r border-border/50 min-w-[42px] align-top"
            >
              {entries.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {entries.map(([shift, count]) => (
                    <span key={shift} className="text-[9px] font-medium text-muted-foreground">
                      {shift}: {count}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[9px] text-muted-foreground/30">—</span>
              )}
            </td>
          )
        })}
      </tr>
    </tfoot>
  )
}
