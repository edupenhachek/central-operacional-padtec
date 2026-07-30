import { useState, useEffect } from 'react'
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
import { TURNO_OPTIONS, PROJETO_ESCALA_OPTIONS, createEscala } from '@/services/escalas'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

interface EscalaFormModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function EscalaFormModal({ open, onClose, onCreated }: EscalaFormModalProps) {
  const [data, setData] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [projeto, setProjeto] = useState('')
  const [turno, setTurno] = useState('')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      getUsers()
        .then(setUsers)
        .catch(() => {})
      setData('')
      setUsuarioId('')
      setProjeto('')
      setTurno('')
      setFieldErrors({})
    }
  }, [open])

  const handleSubmit = async () => {
    setFieldErrors({})
    setLoading(true)
    try {
      await createEscala({ Data: data, Usuario_ID: usuarioId, Projeto: projeto, Turno: turno })
      toast.success('Plantão criado com sucesso!')
      onCreated()
      onClose()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error('Erro ao criar plantão.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'h-10 text-sm bg-background dark:bg-slate-900/80 border-input'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">Novo Plantão</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Data</Label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className={inputCls}
            />
            {fieldErrors.Data && <p className="text-xs text-red-500">{fieldErrors.Data}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Usuário</Label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger className={inputCls}>
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
            {fieldErrors.Usuario_ID && (
              <p className="text-xs text-red-500">{fieldErrors.Usuario_ID}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Projeto</Label>
            <Select value={projeto} onValueChange={setProjeto}>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {PROJETO_ESCALA_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.Projeto && <p className="text-xs text-red-500">{fieldErrors.Projeto}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Turno</Label>
            <Select value={turno} onValueChange={setTurno}>
              <SelectTrigger className={inputCls}>
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
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
