import { useState, useMemo } from 'react'
import {
  CalendarDays,
  Users,
  Clock,
  Pencil,
  Check,
  Plane,
  CalendarRange,
  CalendarClock,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { MyScheduleTab } from '@/components/MyScheduleTab'
import { OperationScheduleTab } from '@/components/OperationScheduleTab'
import { TodayScheduleTab } from '@/components/TodayScheduleTab'
import { PatternManagerTab } from '@/components/PatternManagerTab'
import { VacationModal } from '@/components/VacationModal'
import { HolidayModal } from '@/components/HolidayModal'
import { BatchEscalaModal } from '@/components/BatchEscalaModal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { FOCAL_ROLES, type PeriodMode } from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

type TabKey = 'operacao' | 'minha' | 'hoje' | 'padroes'

export default function Escalas() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('operacao')
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth()))
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()))
  const [projetoFilter, setProjetoFilter] = useState('all')
  const [vacationOpen, setVacationOpen] = useState(false)
  const [holidayOpen, setHolidayOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [periodMode, setPeriodMode] = useState<PeriodMode>('mes')
  const [editMode, setEditMode] = useState(false)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [batchOpen, setBatchOpen] = useState(false)

  const canManage = user?.role ? FOCAL_ROLES.includes(user.role) : false

  const batchDefaultDates = useMemo(() => {
    const year = Number(yearFilter)
    const month = Number(monthFilter)
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    }
  }, [monthFilter, yearFilter])

  const handleToggleEditMode = () => {
    if (editMode && hasPendingChanges) {
      toast.warning('Você tem alterações não salvas. Salve antes de finalizar.')
      return
    }
    setEditMode((prev) => !prev)
  }

  const tabs: { key: TabKey; label: string; icon: typeof Users }[] = [
    { key: 'operacao', label: 'Escala da Operação', icon: CalendarDays },
    { key: 'minha', label: 'Minha Escala', icon: Users },
    { key: 'hoje', label: 'Escala HOJE', icon: Clock },
    { key: 'padroes', label: 'Padrões de Escala', icon: CalendarRange },
  ]

  return (
    <div className="space-y-6 animate-fade-in w-full px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escalas de Trabalho</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os plantões da equipe.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="inline-flex gap-1 p-1 bg-muted rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button onClick={() => setHolidayOpen(true)} variant="outline" className="text-sm gap-2">
            <CalendarClock className="w-4 h-4" /> Feriados
          </Button>
          {canManage && (
            <>
              <Button
                onClick={() => setVacationOpen(true)}
                variant="outline"
                className="text-sm gap-2"
              >
                <Plane className="w-4 h-4" /> Lançar Férias
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleToggleEditMode}
                  className={cn(
                    'text-white text-sm gap-2',
                    editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700',
                  )}
                >
                  {editMode ? (
                    <>
                      <Check className="w-4 h-4" /> Finalizar Edição
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" /> Editar Escala
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setBatchOpen(true)}
                  variant="outline"
                  className="text-sm gap-2"
                >
                  <Plus className="w-4 h-4" /> Gerar Escala
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {activeTab === 'padroes' ? (
        <PatternManagerTab />
      ) : activeTab === 'hoje' ? (
        <TodayScheduleTab />
      ) : activeTab === 'operacao' ? (
        <OperationScheduleTab
          monthFilter={monthFilter}
          yearFilter={yearFilter}
          projetoFilter={projetoFilter}
          periodMode={periodMode}
          editMode={editMode}
          onMonthChange={setMonthFilter}
          onYearChange={setYearFilter}
          onProjetoChange={setProjetoFilter}
          onPeriodModeChange={setPeriodMode}
          onPendingChangesChange={setHasPendingChanges}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <MyScheduleTab
          monthFilter={monthFilter}
          yearFilter={yearFilter}
          onMonthChange={setMonthFilter}
          onYearChange={setYearFilter}
        />
      )}

      <VacationModal
        open={vacationOpen}
        onClose={() => setVacationOpen(false)}
        onSaved={() => setRefreshTrigger((t) => t + 1)}
      />
      <HolidayModal
        open={holidayOpen}
        onClose={() => setHolidayOpen(false)}
        month={Number(monthFilter)}
        year={Number(yearFilter)}
        canManage={canManage}
        onSaved={() => setRefreshTrigger((t) => t + 1)}
      />
      <BatchEscalaModal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        onSaved={() => setRefreshTrigger((t) => t + 1)}
        defaultStartDate={batchDefaultDates.start}
        defaultEndDate={batchDefaultDates.end}
      />
    </div>
  )
}
