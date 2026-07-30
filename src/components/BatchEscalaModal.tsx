import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers, type UserItem } from '@/services/users'
import {
  TURNO_OPTIONS,
  PATTERN_OPTIONS,
  generateEscalaDates,
  batchCreateEscalas,
} from '@/services/escalas'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

interface BatchEscalaModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function BatchEscalaModal({ open, onClose, onSaved }: BatchEscalaModalProps) {
  const [usuarioId, setUsuarioId] = useState('')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [padrao, setPadrao] = useState<string>(PATTERN_OPTIONS[0])
  const [turno, setTurno] = useState('')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open) {
      getUsers()
        .then(setUsers)
        .catch(() => {})
      setUsuarioId('')
      setDataInicial('')
      setDataFinal('')
      setPadrao(PATTERN_OPTIONS[0])
      setTurno('')
      setFieldErrors({})
      setValidationErrors({})
    }
  }, [open])

  const selectedUser = useMemo(() => users.find((u) => u.id === usuarioId), [users, usuarioId])
  const userProjeto = selectedUser?.projeto?.[0] || ''

  const validateForm = () => {
    const errors: Record<string, boolean> = {}
    if (!usuarioId) errors.usuarioId = true
    if (!dataInicial) errors.dataInicial = true
    if (!dataFinal) errors.dataFinal = true
    if (!turno) errors.turno = true
    if (dataInicial && dataFinal && new Date(dataInicial) > new Date(dataFinal)) {
      errors.dataFinal = true
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    setFieldErrors({})
    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    if (!userProjeto) {
      toast.error('O colaborador selecionado não possui projeto definido.')
      return
    }
    setLoading(true)
    try {
      const dates = generateEscalaDates(dataInicial, dataFinal, padrao)
      if (dates.length === 0) {
        toast.error('Nenhuma data encontrada no período selecionado.')
        return
      }
      const records = dates.map((date) => ({
        Data: date,
        Usuario_ID: usuarioId,
        Projeto: userProjeto,
        Turno: turno,
        Status: 'Previsto',
      }))
      const { succeeded, failed } = await batchCreateEscalas(records)
      if (failed > 0) {
        toast.warning(`${succeeded} plantões criados, ${failed} falharam.`)
      } else {
        toast.success(`${succeeded} plantões criados com sucesso!`)
      }
      onSaved()
      onClose()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error('Erro ao gerar escala.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'h-10 text-sm bg-background dark:bg-slate-900/80 border-input'
  const requiredMark = <span className="text-red-500 ml-0.5">*</span>

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">Gerar Escala</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Colaborador {requiredMark}</Label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger
                className={cn(inputCls, validationErrors.usuarioId && 'border-red-500')}
              >
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.usuarioId && (
              <p className="text-xs text-red-500">Colaborador é obrigatório.</p>
            )}
            {fieldErrors.Usuario_ID && (
              <p className="text-xs text-red-500">{fieldErrors.Usuario_ID}</p>
            )}
          </div>

          {userProjeto && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Projeto (automático)</Label>
              <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
                {userProjeto}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data Inicial {requiredMark}</Label>
              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className={cn(inputCls, validationErrors.dataInicial && 'border-red-500')}
              />
              {validationErrors.dataInicial && <p className="text-xs text-red-500">Obrigatória.</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data Final {requiredMark}</Label>
              <Input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className={cn(inputCls, validationErrors.dataFinal && 'border-red-500')}
              />
              {validationErrors.dataFinal && <p className="text-xs text-red-500">Obrigatória.</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Padrão de Escala {requiredMark}</Label>
            <Select value={padrao} onValueChange={setPadrao}>
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PATTERN_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Turno {requiredMark}</Label>
            <Select value={turno} onValueChange={setTurno}>
              <SelectTrigger className={cn(inputCls, validationErrors.turno && 'border-red-500')}>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {TURNO_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.turno && <p className="text-xs text-red-500">Turno é obrigatório.</p>}
            {fieldErrors.Turno && <p className="text-xs text-red-500">{fieldErrors.Turno}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {loading ? 'Gerando...' : 'Gerar Escala'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
