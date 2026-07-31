import { useState, useEffect, useCallback, useMemo } from 'react'
import { CalendarDays, Search, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getUsers, type UserItem } from '@/services/users'
import { getEscalasForMonth } from '@/services/escala-matrix'
import { type EscalaRecord } from '@/services/escalas'
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
import {
  FOCAL_ROLES,
  QUICK_FILTER_PILLS,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  filterUsersByPill,
  getDaysInMonth,
  isCoordinator,
} from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

interface OperationScheduleTabProps {
  monthFilter: string
  yearFilter: string
  projetoFilter: string
  onMonthChange: (v: string) => void
  onYearChange: (v: string) => void
  onProjetoChange: (v: string) => void
  refreshTrigger?: number
}

export function OperationScheduleTab({
  monthFilter,
  yearFilter,
  projetoFilter,
  onMonthChange,
  onYearChange,
  onProjetoChange,
  refreshTrigger,
}: OperationScheduleTabProps) {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [escalas, setEscalas] = useState<EscalaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
  }, [loadData, refreshTrigger])

  useRealtime('escalas', () => loadData())

  const { coordinators, operational } = useMemo(() => {
    const pillFiltered = filterUsersByPill(
      users.filter((u) => u.participa_escala !== false),
      projetoFilter,
    )
    const coords = pillFiltered.filter((u) => isCoordinator(u.name))
    const ops = pillFiltered.filter((u) => !isCoordinator(u.name))
    const q = searchQuery.trim().toLowerCase()
    const searched = q ? ops.filter((u) => u.name.toLowerCase().includes(q)) : ops
    return { coordinators: coords, operational: searched }
  }, [users, projetoFilter, searchQuery])

  const days = useMemo(
    () => getDaysInMonth(Number(monthFilter), Number(yearFilter)),
    [monthFilter, yearFilter],
  )

  return (
    <div className="space-y-4">
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
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar colaborador..."
                className="w-full h-9 pl-8 pr-3 text-xs rounded-md border border-input bg-background dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" /> Escala da Operação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MatrixGrid
                users={operational}
                escalas={escalas}
                days={days}
                canEdit={canManage}
                onCellSaved={loadData}
              />
            </CardContent>
          </Card>
          {coordinators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" /> Coordenação da Operação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MatrixGrid
                  users={coordinators}
                  escalas={escalas}
                  days={days}
                  canEdit={canManage}
                  onCellSaved={loadData}
                  showFooter={false}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
