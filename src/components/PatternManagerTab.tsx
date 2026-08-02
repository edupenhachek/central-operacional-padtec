import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, CalendarRange } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getPatterns, deletePattern, type PadraoEscalaRecord } from '@/services/padroes-escala'
import { useAuth } from '@/hooks/use-auth'
import { FOCAL_ROLES } from '@/lib/escala-utils'
import { PatternConfigModal } from '@/components/PatternConfigModal'
import { useRealtime } from '@/hooks/use-realtime'

export function PatternManagerTab() {
  const { user } = useAuth()
  const [patterns, setPatterns] = useState<PadraoEscalaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPattern, setEditingPattern] = useState<PadraoEscalaRecord | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const canManage = user?.role ? FOCAL_ROLES.includes(user.role) : false

  const loadPatterns = useCallback(async () => {
    try {
      const data = await getPatterns()
      setPatterns(data)
    } catch {
      toast.error('Erro ao carregar padrões.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPatterns()
  }, [loadPatterns])
  useRealtime('padroes_escala', () => {
    loadPatterns()
  })

  const handleNew = () => {
    setEditingPattern(null)
    setModalOpen(true)
  }
  const handleEdit = (p: PadraoEscalaRecord) => {
    setEditingPattern(p)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePattern(deleteId)
      toast.success('Padrão excluído.')
    } catch {
      toast.error('Erro ao excluir padrão.')
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Carregando padrões...</div>

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gerencie os padrões de escala rotativos da operação.
        </p>
        {canManage && (
          <Button
            onClick={handleNew}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Padrão
          </Button>
        )}
      </div>
      {patterns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarRange className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum padrão cadastrado.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patterns.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.qtd_semanas} semana{p.qtd_semanas > 1 ? 's' : ''}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(p)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <PatternConfigModal
        open={modalOpen}
        pattern={editingPattern}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          loadPatterns()
        }}
      />
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir padrão?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
