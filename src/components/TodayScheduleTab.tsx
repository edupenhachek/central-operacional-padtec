import { useState, useEffect, useCallback } from 'react'
import { Phone, Mail, MessageSquare, CalendarClock } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { getTodayEscalas, type EscalaRecord } from '@/services/escalas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getProjectBadgeLabel, PROJECT_BADGE_COLORS, getTeamsUrl } from '@/lib/collab-utils'
import { getShiftLabel } from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

interface TodayUser {
  id: string
  name: string
  email: string
  phone?: string
  projeto?: string[]
  horario_trabalho?: string
}

interface TodayEscala extends EscalaRecord {
  expand?: { Usuario_ID?: TodayUser }
}

export function TodayScheduleTab() {
  const [escalas, setEscalas] = useState<TodayEscala[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getTodayEscalas()
      setEscalas(result as unknown as TodayEscala[])
    } catch {
      setEscalas([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('escalas', () => loadData())

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Escala de Hoje — {todayLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : escalas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma escala encontrada para hoje.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {escalas.map((escala) => {
                const user = escala.expand?.Usuario_ID
                if (!user) return null
                const status = escala.Status || ''
                const turno = escala.Turno || ''
                const statusDisplay = status || (turno ? getShiftLabel(turno) : '—')
                const projectLabel = getProjectBadgeLabel(user.projeto || [])
                const badgeColor = PROJECT_BADGE_COLORS[projectLabel]
                return (
                  <div
                    key={escala.id}
                    className="border border-border rounded-lg p-3 space-y-2 bg-card dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold truncate">{user.name || '—'}</span>
                      {projectLabel && (
                        <Badge
                          variant="outline"
                          className={cn('text-[9px] h-4 px-1 shrink-0', badgeColor)}
                        >
                          {projectLabel}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-medium">Turno:</span>
                      <span>{statusDisplay}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span className="truncate">{user.phone}</span>
                      </div>
                    )}
                    {user.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {user.email && (
                      <a
                        href={getTeamsUrl(user.email)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Abrir no Teams
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
