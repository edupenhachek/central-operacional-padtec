import { Phone, Mail, MessageSquare } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getCollaboratorBadgeLabel,
  getProjectBadgeLabel,
  COLLAB_BADGE_COLORS,
  PROJECT_BADGE_COLORS,
  getTeamsUrl,
} from '@/lib/collab-utils'
import type { UserItem } from '@/services/users'

interface CollaboratorCellProps {
  user: UserItem
}

export function CollaboratorCell({ user }: CollaboratorCellProps) {
  const badgeLabel = getCollaboratorBadgeLabel(user.name || '')
  const projectLabel = getProjectBadgeLabel(user.projeto || [])
  const badgeText = badgeLabel || projectLabel
  const badgeColor = badgeLabel
    ? COLLAB_BADGE_COLORS[badgeLabel]
    : PROJECT_BADGE_COLORS[projectLabel]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-left w-full cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5 transition-colors">
          <div className="text-xs font-semibold text-foreground truncate max-w-[160px]">
            {user.name || user.email}
          </div>
          {badgeText && (
            <Badge
              variant="outline"
              className={cn('text-[9px] h-4 px-1 mt-0.5 font-semibold', badgeColor)}
            >
              {badgeText}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="right" align="start">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">{user.name || '—'}</p>
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Abrir no Teams
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
