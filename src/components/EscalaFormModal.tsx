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
import {
  TURNO_OPTIONS,
  PROJETO_ESCALA_OPTIONS,
  STATUS_OPTIONS,
  createEscala,
  updateEscala,
} from '@/services/escalas'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

interface EscalaFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  escala?: {
    id: string
    Data: string
    Usuario_ID: string
    Projeto: string
    Turno: string
    Status: string
  } | null
  onClose: () => void
  onSaved: () => void
}

export function EscalaFormModal({ open, mode, escala, onClose, onSaved }: EscalaFormModalProps) {
  const [data, setData] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [projeto, setProjeto] = useState('')
  const [turno, setTurno] = useState('')
  const [status, setStatus] = useState('Previsto')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      getUsers()
        .then(setUsers)
        .catch(() => {})
      if (mode === 'edit' && escala) {
        setData(escala.Data ? escala.Data.split(' ')[0] : '')
        setUsuarioId(escala.Usuario_ID || '')
        setProjeto(escala.Projeto || '')
        setTurno(escala.Turno || '')
        setStatus(escala.Status || 'Previsto')
      } else {
        setData('')
        setUsuarioId('')
        setProjeto('')
        setTurno('')
        setStatus('Previsto')
      }
      setFieldErrors({})
    }
  }, [open, mode, escala])

  const handleSubmit = async () => {
    setFieldErrors({})
    setLoading(true)
    try {
      const payload = { Data: data, Usuario_ID: usuarioId, Projeto: projeto, Turno: turno }
      if (mode === 'edit' && escala) {
        await updateEscala(escala.id, { ...payload, Status: status })
        toast.success('Plantão atualizado com sucesso!')
      } else {
        await createEscala(payload)
        toast.success('Plantão criado com sucesso!')
      }
      onSaved()
      onClose()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error(mode === 'edit' ? 'Erro ao atualizar plantão.' : 'Erro ao criar plantão.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'h-10 text-sm bg-background dark:bg-slate-900/80 border-input'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {mode === 'edit' ? 'Editar Plantão' : 'Novo Plantão'}
          </DialogTitle>
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
          {mode === 'edit' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.Status && <p className="text-xs text-red-500">{fieldErrors.Status}</p>}
            </div>
          )}
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
