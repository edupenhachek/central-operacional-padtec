import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers, type UserItem } from '@/services/users'
import { launchVacation } from '@/services/escala-matrix'
import { cn } from '@/lib/utils'

interface VacationModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function VacationModal({ open, onClose, onSaved }: VacationModalProps) {
  const [usuarioId, setUsuarioId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [quantidadeDias, setQuantidadeDias] = useState('')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open) {
      getUsers()
        .then((u) => setUsers(u.filter((x) => x.participa_escala !== false)))
        .catch(() => {})
      setUsuarioId('')
      setDataInicio('')
      setQuantidadeDias('')
      setErrors({})
    }
  }, [open])

  const selectedUser = useMemo(() => users.find((u) => u.id === usuarioId), [users, usuarioId])
  const userProjeto = (selectedUser?.projeto || [])[0] || ''

  const handleSubmit = async () => {
    const errs: Record<string, boolean> = {}
    if (!usuarioId) errs.usuarioId = true
    if (!dataInicio) errs.dataInicio = true
    const numDays = parseInt(quantidadeDias, 10)
    if (!quantidadeDias || isNaN(numDays) || numDays < 1) errs.quantidadeDias = true
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    if (!userProjeto) {
      toast.error('O colaborador não possui projeto definido.')
      return
    }
    setLoading(true)
    try {
      const result = await launchVacation(usuarioId, dataInicio, numDays, userProjeto)
      if (result.failed > 0) {
        toast.warning(`${result.succeeded} dias de férias lançados, ${result.failed} falharam.`)
      } else {
        toast.success(`${result.succeeded} dias de férias lançados com sucesso!`)
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao lançar férias.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'h-10 text-sm bg-background dark:bg-slate-900/80 border-input'
  const reqMark = <span className="text-red-500 ml-0.5">*</span>

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">Lançar Férias</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Colaborador {reqMark}</Label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger className={cn(inputCls, errors.usuarioId && 'border-red-500')}>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id} textValue={u.name || u.email}>
                    {u.name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.usuarioId && <p className="text-xs text-red-500">Colaborador é obrigatório.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data de Início {reqMark}</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className={cn(inputCls, errors.dataInicio && 'border-red-500')}
              />
              {errors.dataInicio && <p className="text-xs text-red-500">Obrigatório.</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quantidade de Dias {reqMark}</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={quantidadeDias}
                onChange={(e) => setQuantidadeDias(e.target.value)}
                className={cn(inputCls, errors.quantidadeDias && 'border-red-500')}
                placeholder="Ex: 30"
              />
              {errors.quantidadeDias && (
                <p className="text-xs text-red-500">Obrigatório (mín. 1).</p>
              )}
            </div>
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
              {loading ? 'Lançando...' : 'Lançar Férias'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
