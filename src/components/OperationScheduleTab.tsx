import { useState, useEffect, useCallback, useMemo } from 'react'
import { CalendarDays, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getUsers, type UserItem } from '@/services/users'
import { getEscalasForRange } from '@/services/escala-matrix'
import { type EscalaRecord } from '@/services/escalas'
import { getFeriadosForRange } from '@/services/feriados'
import { MatrixGrid } from '@/components/MatrixGrid'
import { EscalaLegend } from '@/components/EscalaLegend'
import { ScheduleStandardsGuide } from '@/components/ScheduleStandardsGuide'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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
  getDaysInRange,
  getRangeForPeriod,
  getPeriodLabel,
  formatDateStr,
  isCoordinator,
  feriadosToMap,
  type PeriodMode,
  type PendingChange,
} from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

interface OperationScheduleTabProps {
  monthFilter: string
  yearFilter: string
  projetoFilter: string
  periodMode: PeriodMode
  editMode: boolean
  onMonthChange: (v: string) => void
  onYearChange: (v: string) => void
  onProjetoChange: (v: string) => void
  onPeriodModeChange: (mode: PeriodMode) => void
  onPendingChangesChange?: (hasPending: boolean) => void
  refreshTrigger?: number
  injectedChanges?: PendingChange[]
  injectedTrigger?: number
}

export function OperationScheduleTab({
  monthFilter,
  yearFilter,
  projetoFilter,
  periodMode,
  editMode,
  onMonthChange,
  onYearChange,
  onProjetoChange,
  onPeriodModeChange,
  onPendingChangesChange,
  refreshTrigger,
  injectedChanges,
  injectedTrigger,
}: OperationScheduleTabProps) {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [escalas, setEscalas] = useState<EscalaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [holidays, setHolidays] = useState<Record<string, string>>({})

  const canManage = user?.role ? FOCAL_ROLES.includes(user.role) : false
  const canEdit = canManage && editMode

  const navigateMonth = (direction: -1 | 1) => {
    const currentMonth = Number(monthFilter)
    let newMonth = currentMonth + direction
    let newYear = Number(yearFilter)
    if (newMonth < 0) {
      newMonth = 11
      newYear--
    }
    if (newMonth > 11) {
      newMonth = 0
      newYear++
    }
    onMonthChange(String(newMonth))
    onYearChange(String(newYear))
  }

  const range = useMemo(
    () => getRangeForPeriod(periodMode, Number(monthFilter), Number(yearFilter)),
    [periodMode, monthFilter, yearFilter],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [u, e, f] = await Promise.all([
        getUsers('participa_escala = true'),
        getEscalasForRange(formatDateStr(range.start), formatDateStr(range.end)),
        getFeriadosForRange(formatDateStr(range.start), formatDateStr(range.end)),
      ])
      setUsers(u)
      setEscalas(e as unknown as EscalaRecord[])
      setHolidays(feriadosToMap(f as unknown as { data: string; nome: string }[]))
    } catch {
      setUsers([])
      setEscalas([])
      setHolidays({})
    } finally {
      setLoading(false)
    }
  }, [range.start, range.end])

  useEffect(() => {
    loadData()
  }, [loadData, refreshTrigger])
  useRealtime('escalas', () => loadData())
  useRealtime('feriados', () => loadData())

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

  const days = useMemo(() => getDaysInRange(range.start, range.end), [range.start, range.end])
  const periodLabel = getPeriodLabel(periodMode, Number(monthFilter), Number(yearFilter))
  const [hasPending, setHasPending] = useState(false)

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
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
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 shrink-0">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                    <span>Escala da Operação</span>
                    <Badge variant="secondary">
                      {projetoFilter === 'all' ? 'Geral' : projetoFilter}
                    </Badge>
                  </div>
                  <div className="flex-1 text-center uppercase">{periodLabel}</div>
                  <div className="shrink-0 min-w-[100px] text-right">
                    {hasPending && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Alterações pendentes
                      </span>
                    )}
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="inline-flex gap-1 p-0.5 bg-muted rounded-md">
                    <Button
                      size="sm"
                      variant={periodMode === 'mes' ? 'default' : 'ghost'}
                      onClick={() => onPeriodModeChange('mes')}
                      className="h-7 text-[11px] px-2"
                    >
                      Mês Comum
                    </Button>
                    <Button
                      size="sm"
                      variant={periodMode === 'ponto-senior' ? 'default' : 'ghost'}
                      onClick={() => onPeriodModeChange('ponto-senior')}
                      className="h-7 text-[11px] px-2"
                    >
                      Ponto Senior
                    </Button>
                  </div>
                  <EscalaLegend />
                  <ScheduleStandardsGuide />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MatrixGrid
                users={operational}
                escalas={escalas}
                days={days}
                canEdit={canEdit}
                holidays={holidays}
                onCellSaved={loadData}
                onPendingChangesChange={(hasPending) => {
                  setHasPending(hasPending)
                  onPendingChangesChange?.(hasPending)
                }}
                injectedChanges={injectedChanges}
                injectedTrigger={injectedTrigger}
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
                  canEdit={canEdit}
                  holidays={holidays}
                  onCellSaved={loadData}
                  showFooter={false}
                  injectedChanges={injectedChanges}
                  injectedTrigger={injectedTrigger}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
