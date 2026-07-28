import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tab } from '@/hooks/use-tabs'

interface TabBarProps {
  tabs: Tab[]
  activePath: string | null
  onActivate: (path: string) => void
  onClose: (path: string) => void
}

export function TabBar({ tabs, activePath, onActivate, onClose }: TabBarProps) {
  if (tabs.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-2 h-9 border-b border-border bg-card/40 overflow-x-auto shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onActivate(tab.path)}
          className={cn(
            'group flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap',
            tab.path === activePath
              ? 'bg-muted text-foreground dark:text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          )}
        >
          <span>{tab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose(tab.path)
            }}
            className={cn(
              'rounded p-0.5 transition-all',
              tab.path === activePath
                ? 'opacity-60 hover:opacity-100 hover:bg-muted-foreground/20'
                : 'opacity-0 group-hover:opacity-60 hover:opacity-100 hover:bg-muted-foreground/20',
            )}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
