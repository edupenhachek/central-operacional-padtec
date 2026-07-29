import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/stores/gutenberg-chat'

interface ChatHistorySidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onClose?: () => void
  className?: string
}

export function ChatHistorySidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onClose,
  className,
}: ChatHistorySidebarProps) {
  return (
    <div className={cn('flex flex-col bg-card border-r border-border', className)}>
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground dark:text-slate-100">Histórico</span>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Button onClick={onNewChat} size="sm" variant="outline" className="m-2 gap-1.5 text-xs">
        <Plus className="w-3.5 h-3.5" /> Novo Chat
      </Button>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground dark:text-slate-400 text-center">
            Nenhuma conversa anterior
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors border-b border-border/50',
                conv.id === activeId && 'bg-muted font-medium',
              )}
            >
              <p className="truncate text-foreground dark:text-slate-200">
                {conv.title || 'Sem título'}
              </p>
              <p className="text-[10px] text-muted-foreground dark:text-slate-400">
                {conv.updated ? new Date(conv.updated).toLocaleDateString('pt-BR') : ''}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
