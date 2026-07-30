import { UserCheck, UserX, Download, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BatchActionBarProps {
  selectedCount: number
  canActivateDeactivate: boolean
  canExport: boolean
  canDelete: boolean
  onClear: () => void
  onActivate: () => void
  onDeactivate: () => void
  onExport: () => void
  onDelete: () => void
}

export function BatchActionBar({
  selectedCount,
  canActivateDeactivate,
  canExport,
  canDelete,
  onClear,
  onActivate,
  onDeactivate,
  onExport,
  onDelete,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          {selectedCount} usuário{selectedCount !== 1 ? 's' : ''} selecionado
          {selectedCount !== 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="h-7 w-7 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {canActivateDeactivate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onActivate}
            className="text-xs font-medium gap-1.5 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Ativar
          </Button>
        )}
        {canActivateDeactivate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
            className="text-xs font-medium gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            <UserX className="w-3.5 h-3.5" />
            Desativar
          </Button>
        )}
        {canExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="text-xs font-medium gap-1.5 dark:border-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-xs font-medium gap-1.5 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir
          </Button>
        )}
      </div>
    </div>
  )
}
