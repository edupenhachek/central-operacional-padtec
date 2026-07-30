import { useState } from 'react'
import { CalendarDays, Users } from 'lucide-react'
import { MyScheduleTab } from '@/components/MyScheduleTab'
import { OperationScheduleTab } from '@/components/OperationScheduleTab'
import { cn } from '@/lib/utils'

type TabKey = 'operacao' | 'minha'

export default function Escalas() {
  const [activeTab, setActiveTab] = useState<TabKey>('operacao')

  const tabs: { key: TabKey; label: string; icon: typeof Users }[] = [
    { key: 'operacao', label: 'Escala da Operação', icon: CalendarDays },
    { key: 'minha', label: 'Minha Escala', icon: Users },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escalas de Trabalho</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os plantões da equipe.</p>
      </div>

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

      {activeTab === 'operacao' ? <OperationScheduleTab /> : <MyScheduleTab />}
    </div>
  )
}
