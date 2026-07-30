import { useState, useEffect, useCallback } from 'react'
import { Bell, CalendarPlus, CalendarClock, Palmtree, CheckCheck } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getNotifications, markAllAsRead, type NotificationRecord } from '@/services/notifications'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  schedule_created: {
    icon: CalendarPlus,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-950/60',
  },
  schedule_updated: {
    icon: CalendarClock,
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
  },
  vacation_approved: {
    icon: Palmtree,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-950/60',
  },
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h atrás`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d atrás`
  return date.toLocaleDateString('pt-BR')
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) return
    getNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  useRealtime(
    'notifications',
    (e) => {
      if (e.action === 'create') {
        const rec = e.record as unknown as NotificationRecord
        setNotifications((prev) => [rec, ...prev])
        toast(rec.title, {
          description: rec.content.length > 100 ? rec.content.slice(0, 100) + '...' : rec.content,
          duration: 4000,
        })
      } else if (e.action === 'update') {
        const rec = e.record as unknown as NotificationRecord
        setNotifications((prev) => prev.map((n) => (n.id === rec.id ? rec : n)))
      } else if (e.action === 'delete') {
        const rec = e.record as unknown as NotificationRecord
        setNotifications((prev) => prev.filter((n) => n.id !== rec.id))
      }
    },
    !!user,
  )

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl shadow-2xl border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-7 text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.schedule_created
                const Icon = config.icon
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                      !n.read && 'bg-blue-50/50 dark:bg-blue-950/20',
                    )}
                  >
                    <div
                      className={cn(
                        'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        config.bg,
                      )}
                    >
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-sm truncate', !n.read && 'font-bold')}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatRelativeTime(n.created)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
