import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Plus, CalendarClock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  getFeriadosForMonth,
  createFeriado,
  deleteFeriado,
  type FeriadoRecord,
} from '@/services/feriados'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

interface HolidayModalProps {
  open: boolean
  onClose: () => void
  month: number
  year: number
  canManage: boolean
  onSaved?: () => void
}

function parseDateStr(raw: string): string {
  return raw?.split('T')[0].split(' ')[0] || raw
}

export function HolidayModal({
  open,
  onClose,
  month,
  year,
  canManage,
  onSaved,
}: HolidayModalProps) {
  const [feriados, setFeriados] = useState<FeriadoRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ data: '', nome: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFeriadosForMonth(month, year)
      setFeriados(result)
    } catch {
      setFeriados([])
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    if (open) {
      loadData()
      setFormData({ data: '', nome: '' })
      setErrors({})
    }
  }, [open, loadData])

  const handleAdd = async () => {
    const errs: FieldErrors = {}
    if (!formData.data) errs.data = 'Data é obrigatória.'
    if (!formData.nome.trim()) errs.nome = 'Nome é obrigatório.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      await createFeriado({ data: formData.data, nome: formData.nome.trim() })
      toast.success('Feriado adicionado!')
      setFormData({ data: '', nome: '' })
      setErrors({})
      await loadData()
      onSaved?.()
    } catch (err) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        setErrors(fieldErrs)
      } else {
        toast.error('Erro ao adicionar feriado.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteFeriado(deleteId)
      toast.success('Feriado removido.')
      setDeleteId(null)
      await loadData()
      onSaved?.()
    } catch {
      toast.error('Erro ao remover feriado.')
    }
  }

  const inputCls = 'h-10 text-sm bg-background dark:bg-slate-900/80 border-input'

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-600" />
              Feriados — {format(new Date(year, month, 1), "MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {canManage && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Data *</Label>
                    <Input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className={cn(inputCls, errors.data && 'border-red-500')}
                    />
                    {errors.data && <p className="text-xs text-red-500">{errors.data}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Nome *</Label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Independência"
                      className={cn(inputCls, errors.nome && 'border-red-500')}
                    />
                    {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
                  </div>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={submitting}
                  size="sm"
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Adicionando...' : 'Adicionar Feriado'}
                </Button>
              </div>
            )}
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : feriados.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum feriado cadastrado para este período.
                </div>
              ) : (
                feriados.map((f) => {
                  const dateStr = parseDateStr(f.data)
                  const formatted = format(new Date(dateStr + 'T00:00:00'), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })
                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[80px]">
                          {formatted}
                        </span>
                        <span className="text-sm">{f.nome}</span>
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => setDeleteId(f.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este feriado? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
