import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, CalendarDays, Plane } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getUsers, type UserItem } from '@/services/users'
import { getEscalasForMonth } from '@/services/escala-matrix'
import { type EscalaRecord } from '@/services/escalas'
import { MatrixGrid } from '@/components/MatrixGrid'
import { BatchEscalaModal } from '@/components/BatchEscalaModal'
import { VacationModal } from '@/components/VacationModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FOCAL_ROLES,
  QUICK_FILTER_PILLS,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  filterUsersByPill,
  getDaysInMonth,
} from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

interface OperationScheduleTabProps {
  monthFilter: string
  yearFilter: string
  projetoFilter: string
  onMonthChange: (v: string) => void
  onYearChange: (v: string) => void
  onProjetoChange: (v: string) => void
}

export function OperationScheduleTab({
  monthFilter,
  yearFilter,
  projetoFilter,
  onMonthChange,
  onYearChange,
  onProjetoChange,
}: OperationScheduleTabProps) {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [escalas, setEscalas] = useState<EscalaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [batchOpen, setBatchOpen] = useState(false)
  const [vacationOpen, setVacationOpen] = useState(false)

  const canManage = user?.role ? FOCAL_ROLES.includes(user.role) : false

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [u, e] = await Promise.all([
        getUsers('participa_escala = true'),
        getEscalasForMonth(Number(monthFilter), Number(yearFilter)),
      ])
      setUsers(u)
      setEscalas(e as unknown as EscalaRecord[])
    } catch {
      setUsers([])
      setEscalas([])
    } finally {
      setLoading(false)
    }
  }, [monthFilter, yearFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('escalas', () => loadData())

  const filteredUsers = useMemo(
    () =>
      filterUsersByPill(
        users.filter((u) => u.participa_escala !== false),
        projetoFilter,
      ),
    [users, projetoFilter],
  )
  const days = useMemo(
    () => getDaysInMonth(Number(monthFilter), Number(yearFilter)),
    [monthFilter, yearFilter],
  )

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end gap-2">
          <Button onClick={() => setVacationOpen(true)} variant="outline" className="text-sm gap-2">
            <Plane className="w-4 h-4" /> Lançar Férias
          </Button>
          <Button
            onClick={() => setBatchOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm gap-2"
          >
            <Plus className="w-4 h-4" /> Gerar Escala
          </Button>
        </div>
      )}

      <Card className="border-border bg-card dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={monthFilter} onValueChange={onMonthChange}>
              <SelectTrigger className="h-9 w-36 text-xs bg-background dark:bg-slate-900/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={onYearChange}>
              <SelectTrigger className="h-9 w-28 text-xs bg-background dark:bg-slate-900/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1.5">
              {QUICK_FILTER_PILLS.map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => onProjetoChange(pill.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                    projetoFilter === pill.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" /> Escala da Operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <MatrixGrid
              users={filteredUsers}
              escalas={escalas}
              days={days}
              canEdit={canManage}
              onCellSaved={loadData}
            />
          )}
        </CardContent>
      </Card>

      <BatchEscalaModal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        onSaved={loadData}
        defaultMonth={monthFilter}
        defaultYear={yearFilter}
      />
      <VacationModal
        open={vacationOpen}
        onClose={() => setVacationOpen(false)}
        onSaved={loadData}
      />
    </div>
  )
}
