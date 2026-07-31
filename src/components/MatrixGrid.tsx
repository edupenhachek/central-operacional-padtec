import { useState, useMemo } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CellEditContent } from '@/components/CellEditContent'
import { CollaboratorCell } from '@/components/CollaboratorCell'
import { ShiftFooterRow } from '@/components/ShiftFooterRow'
import { cn } from '@/lib/utils'
import {
  getDayHeader,
  isWeekend,
  formatDateStr,
  STATUS_CELL_LABELS,
  STATUS_CELL_COLORS,
  STATUS_CELL_BG,
  SHIFT_CELL_BG,
  SHIFT_CELL_COLOR,
  WEEKEND_HEADER_CLS,
  WEEKEND_CELL_BG,
  sortUsersBySchedule,
} from '@/lib/escala-utils'
import type { EscalaRecord } from '@/services/escalas'
import type { UserItem } from '@/services/users'

interface MatrixGridProps {
  users: UserItem[]
  escalas: EscalaRecord[]
  days: Date[]
  canEdit: boolean
  onCellSaved: () => void
  showFooter?: boolean
}

export function MatrixGrid({
  users,
  escalas,
  days,
  canEdit,
  onCellSaved,
  showFooter = true,
}: MatrixGridProps) {
  const [editKey, setEditKey] = useState<string | null>(null)

  const sortedUsers = useMemo(() => sortUsersBySchedule(users), [users])

  const escalaMap = useMemo(() => {
    const map = new Map<string, EscalaRecord>()
    for (const e of escalas) {
      const dateKey = e.Data?.split(' ')[0]
      const userId = e.expand?.Usuario_ID?.id
      if (dateKey && userId) map.set(`${userId}_${dateKey}`, e)
    }
    return map
  }, [escalas])

  const cellBg = (turno: string, status: string, weekend: boolean) => {
    if (status && STATUS_CELL_BG[status]) return STATUS_CELL_BG[status]
    if (turno === 'FOLGA') return 'bg-gray-100 dark:bg-gray-800/40'
    if (turno) return SHIFT_CELL_BG
    if (weekend) return WEEKEND_CELL_BG
    return ''
  }

  const getCellTitle = (turno: string, status: string, observacao: string, userHorario: string) => {
    const parts: string[] = []
    if (status && STATUS_CELL_LABELS[status]) {
      parts.push(status)
    } else if (turno === 'FOLGA') {
      parts.push('FOLGA')
    } else if (turno) {
      parts.push(turno)
    } else if (userHorario) {
      parts.push(userHorario)
    }
    if (observacao) parts.push(observacao)
    return parts.length > 0 ? parts.join(' — ') : undefined
  }

  const renderCellContent = (turno: string, status: string) => {
    if (status && STATUS_CELL_LABELS[status]) {
      return (
        <span className={cn('text-[10px] font-bold', STATUS_CELL_COLORS[status])}>
          {STATUS_CELL_LABELS[status]}
        </span>
      )
    }
    if (!turno) return <span className="text-muted-foreground/40">—</span>
    if (turno === 'FOLGA')
      return <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">FOLGA</span>
    return <span className={cn('text-[10px] font-medium', SHIFT_CELL_COLOR)}>T</span>
  }

  const renderObsDot = (observacao: string) =>
    observacao ? (
      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
    ) : null

  if (sortedUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum colaborador encontrado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-20 w-[260px] min-w-[260px] bg-card px-3 py-1.5 text-left text-xs font-semibold border-r border-border">
              Colaborador
            </th>
            <th className="sticky left-[260px] top-0 z-20 w-[140px] min-w-[140px] bg-card px-2 py-1.5 text-center text-[10px] font-semibold border-r border-border">
              Horário
            </th>
            {days.map((day) => {
              const { day: d, weekday } = getDayHeader(day)
              const we = isWeekend(day)
              return (
                <th
                  key={d}
                  className={cn(
                    'sticky top-0 z-20 bg-muted dark:bg-slate-800 px-1 py-1.5 text-center text-[10px] font-semibold border-r border-border/50 min-w-[42px]',
                    we && WEEKEND_HEADER_CLS,
                  )}
                >
                  <div>{d}</div>
                  <div className="text-muted-foreground font-normal capitalize">{weekday}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/20">
              <td className="sticky left-0 z-20 w-[260px] min-w-[260px] bg-card px-2 py-1 border-r border-border">
                <CollaboratorCell user={user} />
              </td>
              <td className="sticky left-[260px] z-20 w-[140px] min-w-[140px] bg-card px-2 py-1 text-center text-[10px] text-muted-foreground border-r border-border align-middle">
                {user.horario_trabalho || '—'}
              </td>
              {days.map((day) => {
                const dateStr = formatDateStr(day)
                const cellKey = `${user.id}_${dateStr}`
                const escala = escalaMap.get(cellKey)
                const turno = escala?.Turno || ''
                const status = escala?.Status || ''
                const observacao = escala?.observacao || ''
                const we = isWeekend(day)
                const cellTitle = getCellTitle(
                  turno,
                  status,
                  observacao,
                  user.horario_trabalho || '',
                )
                if (canEdit) {
                  return (
                    <td
                      key={dateStr}
                      className={cn(
                        'p-0 text-center border-r border-border/50',
                        cellBg(turno, status, we),
                      )}
                    >
                      <Popover
                        open={editKey === cellKey}
                        onOpenChange={(open) => setEditKey(open ? cellKey : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className="w-full h-9 flex items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors relative"
                            title={cellTitle}
                          >
                            {renderCellContent(turno, status)}
                            {renderObsDot(observacao)}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" side="bottom" align="center">
                          <CellEditContent
                            userId={user.id}
                            userProjeto={(user.projeto || [])[0] || ''}
                            userHorario={user.horario_trabalho || ''}
                            dateStr={dateStr}
                            currentTurno={turno}
                            currentStatus={status}
                            currentObservacao={observacao}
                            onSaved={onCellSaved}
                            onClose={() => setEditKey(null)}
                          />
                        </PopoverContent>
                      </Popover>
                    </td>
                  )
                }
                return (
                  <td
                    key={dateStr}
                    className={cn(
                      'h-9 px-1 text-center align-middle border-r border-border/50',
                      cellBg(turno, status, we),
                    )}
                    title={cellTitle}
                  >
                    <div className="flex items-center justify-center h-full relative">
                      {renderCellContent(turno, status)}
                      {renderObsDot(observacao)}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        {showFooter && <ShiftFooterRow escalas={escalas} days={days} />}
      </table>
    </div>
  )
}
