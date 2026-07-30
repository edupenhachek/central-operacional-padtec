import { useState, useEffect, useCallback, useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getEscalasByUser, type EscalaRecord } from '@/services/escalas'
import { MatrixGrid } from '@/components/MatrixGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MONTH_OPTIONS, YEAR_OPTIONS, getDaysInMonth } from '@/lib/escala-utils'
import type { UserItem } from '@/services/users'

interface MyScheduleTabProps {
  monthFilter: string
  yearFilter: string
  onMonthChange: (v: string) => void
  onYearChange: (v: string) => void
}

export function MyScheduleTab({
  monthFilter,
  yearFilter,
  onMonthChange,
  onYearChange,
}: MyScheduleTabProps) {
  const { user } = useAuth()
  const [escalas, setEscalas] = useState<EscalaRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const result = await getEscalasByUser(user.id, Number(monthFilter), Number(yearFilter))
      setEscalas(result as unknown as EscalaRecord[])
    } catch {
      setEscalas([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, monthFilter, yearFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('escalas', () => loadData())

  const days = useMemo(
    () => getDaysInMonth(Number(monthFilter), Number(yearFilter)),
    [monthFilter, yearFilter],
  )

  const userAsList = useMemo<UserItem[]>(() => {
    if (!user) return []
    const projetoArr = Array.isArray(user.projeto)
      ? user.projeto
      : user.projeto
        ? [user.projeto]
        : []
    return [
      {
        id: user.id,
        name: user.name || user.email || '',
        email: user.email,
        cargo: user.cargo,
        role: user.role,
        projeto: projetoArr,
        horario_trabalho: user.horario_trabalho,
        created: '',
        updated: '',
      },
    ]
  }, [user])

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex gap-3">
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" /> Minha Escala
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <MatrixGrid
              users={userAsList}
              escalas={escalas}
              days={days}
              canEdit={false}
              onCellSaved={loadData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
