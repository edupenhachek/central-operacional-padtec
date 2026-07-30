import { useState } from 'react'
import { CalendarDays, Users, Clock, Plus, Plane } from 'lucide-react'
import { MyScheduleTab } from '@/components/MyScheduleTab'
import { OperationScheduleTab } from '@/components/OperationScheduleTab'
import { TodayScheduleTab } from '@/components/TodayScheduleTab'
import { BatchEscalaModal } from '@/components/BatchEscalaModal'
import { VacationModal } from '@/components/VacationModal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { FOCAL_ROLES } from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

type TabKey = 'operacao' | 'minha' | 'hoje'

export default function Escalas() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('operacao')
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth()))
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()))
  const [projetoFilter, setProjetoFilter] = useState('all')
  const [batchOpen, setBatchOpen] = useState(false)
  const [vacationOpen, setVacationOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const canManage = user?.role ? FOCAL_ROLES.includes(user.role) : false

  const tabs: { key: TabKey; label: string; icon: typeof Users }[] = [
    { key: 'operacao', label: 'Escala da Operação', icon: CalendarDays },
    { key: 'minha', label: 'Minha Escala', icon: Users },
    { key: 'hoje', label: 'Escala HOJE', icon: Clock },
  ]

  return (
    <div className="space-y-6 animate-fade-in w-full px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escalas de Trabalho</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os plantões da equipe.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
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
        {activeTab === 'operacao' && canManage && (
          <div className="flex gap-2">
            <Button
              onClick={() => setVacationOpen(true)}
              variant="outline"
              className="text-sm gap-2"
            >
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
      </div>

      {activeTab === 'hoje' ? (
        <TodayScheduleTab />
      ) : activeTab === 'operacao' ? (
        <OperationScheduleTab
          monthFilter={monthFilter}
          yearFilter={yearFilter}
          projetoFilter={projetoFilter}
          onMonthChange={setMonthFilter}
          onYearChange={setYearFilter}
          onProjetoChange={setProjetoFilter}
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

      <BatchEscalaModal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        onSaved={() => setRefreshTrigger((t) => t + 1)}
        defaultMonth={monthFilter}
        defaultYear={yearFilter}
      />
      <VacationModal
        open={vacationOpen}
        onClose={() => setVacationOpen(false)}
        onSaved={() => setRefreshTrigger((t) => t + 1)}
      />
    </div>
  )
}
