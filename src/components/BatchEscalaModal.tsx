import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers, type UserItem } from '@/services/users'
import { TURNO_OPTIONS } from '@/services/escalas'
import { generateMonthlySchedule } from '@/services/escala-matrix'
import { SHIFT_SHORT_LABELS, MONTH_OPTIONS, YEAR_OPTIONS } from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

interface BatchEscalaModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  defaultMonth: string
  defaultYear: string
}

export function BatchEscalaModal({
  open,
  onClose,
  onSaved,
  defaultMonth,
  defaultYear,
}: BatchEscalaModalProps) {
  const [usuarioId, setUsuarioId] = useState('')
  const [month, setMonth] = useState(defaultMonth)
  const [year, setYear] = useState(defaultYear)
  const [useProfile, setUseProfile] = useState(true)
  const [turno, setTurno] = useState(TURNO_OPTIONS[0])
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open) {
      getUsers()
        .then((u) => setUsers(u.filter((x) => x.participa_escala !== false)))
        .catch(() => {})
      setUsuarioId('')
      setMonth(defaultMonth)
      setYear(defaultYear)
      setUseProfile(true)
      setTurno(TURNO_OPTIONS[0])
      setErrors({})
    }
  }, [open, defaultMonth, defaultYear])

  const selectedUser = useMemo(() => users.find((u) => u.id === usuarioId), [users, usuarioId])
  const userProjeto = (selectedUser?.projeto || [])[0] || ''
  const userHorario = selectedUser?.horario_trabalho || ''

  const handleSubmit = async () => {
    const errs: Record<string, boolean> = {}
    if (!usuarioId) errs.usuarioId = true
    if (!month) errs.month = true
    if (!year) errs.year = true
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    if (useProfile && !userHorario) {
      toast.error('O colaborador não possui horário de trabalho definido.')
      return
    }
    if (!userProjeto) {
      toast.error('O colaborador não possui projeto definido.')
      return
    }
    setLoading(true)
    try {
      const shiftForWeekdays = useProfile ? userHorario : turno
      const result = await generateMonthlySchedule(
        usuarioId,
        Number(month),
        Number(year),
        shiftForWeekdays,
        userProjeto,
      )
      if (result.failed > 0) {
        toast.warning(`${result.succeeded} plantões criados, ${result.failed} falharam.`)
      } else {
        toast.success(`${result.succeeded} plantões gerados com sucesso!`)
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao gerar escala.')
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
          <DialogTitle className="font-bold">Gerar Escala</DialogTitle>
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
                    {`${u.name || u.email}${(u.projeto || []).length ? ` (${u.projeto.join('/')})` : ''}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.usuarioId && <p className="text-xs text-red-500">Colaborador é obrigatório.</p>}
          </div>
          {userProjeto && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>
                Projeto: <strong className="text-foreground">{userProjeto}</strong>
              </span>
              {userHorario && (
                <span>
                  Horário:{' '}
                  <strong className="text-foreground">
                    {SHIFT_SHORT_LABELS[userHorario] || userHorario}
                  </strong>
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mês {reqMark}</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className={cn(inputCls, errors.month && 'border-red-500')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ano {reqMark}</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className={cn(inputCls, errors.year && 'border-red-500')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="useProfile"
              checked={useProfile}
              onCheckedChange={(v) => setUseProfile(v === true)}
            />
            <Label htmlFor="useProfile" className="text-xs font-semibold cursor-pointer">
              Preencher com Horário Padrão do Perfil (5x2)
            </Label>
          </div>
          {!useProfile && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Turno para Dias Úteis {reqMark}</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TURNO_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {loading ? 'Gerando...' : 'Gerar Escala'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
