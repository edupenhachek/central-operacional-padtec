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
import { MultiSelect } from '@/components/MultiSelect'
import { getUsers, type UserItem } from '@/services/users'
import { generateScheduleRange } from '@/services/escala-matrix'
import {
  SHIFT_SHORT_LABELS,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  PATTERN_OPTIONS,
  getCycleOptions,
} from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

interface BatchEscalaModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  defaultStartDate: string
  defaultEndDate: string
}

export function BatchEscalaModal({
  open,
  onClose,
  onSaved,
  defaultStartDate,
  defaultEndDate,
}: BatchEscalaModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [pattern, setPattern] = useState('fixo-5x2')
  const [initialCycle, setInitialCycle] = useState('')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open) {
      getUsers()
        .then((u) => setUsers(u.filter((x) => x.participa_escala !== false)))
        .catch(() => {})
      setSelectedUserIds([])
      setStartDate(defaultStartDate)
      setEndDate(defaultEndDate)
      setPattern('fixo-5x2')
      setInitialCycle('')
      setErrors({})
    }
  }, [open, defaultStartDate, defaultEndDate])

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: `${u.name || u.email}${(u.projeto || []).length ? ` (${u.projeto.join('/')})` : ''}`,
      })),
    [users],
  )

  const cycleOptions = useMemo(() => getCycleOptions(pattern), [pattern])

  const handlePatternChange = (value: string) => {
    setPattern(value)
    const opts = getCycleOptions(value)
    setInitialCycle(opts.length > 0 ? opts[0] : '')
  }

  const handleSubmit = async () => {
    const errs: Record<string, boolean> = {}
    if (selectedUserIds.length === 0) errs.users = true
    if (!startDate) errs.startDate = true
    if (!endDate) errs.endDate = true
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }

    const selectedUsers = users
      .filter((u) => selectedUserIds.includes(u.id))
      .map((u) => ({
        id: u.id,
        horario: u.horario_trabalho || '',
        projeto: (u.projeto || [])[0] || '',
      }))

    const invalidUsers = selectedUsers.filter((u) => !u.horario || !u.projeto)
    if (invalidUsers.length > 0) {
      toast.error('Alguns colaboradores não possuem horário ou projeto definido.')
      return
    }

    setLoading(true)
    try {
      const result = await generateScheduleRange(
        selectedUsers,
        startDate,
        endDate,
        pattern,
        initialCycle,
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
            <Label className="text-xs font-semibold">Colaboradores {reqMark}</Label>
            <MultiSelect
              options={userOptions}
              selected={selectedUserIds}
              onChange={setSelectedUserIds}
              placeholder="Selecionar colaboradores"
            />
            {errors.users && (
              <p className="text-xs text-red-500">Selecione ao menos um colaborador.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data de Início {reqMark}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(inputCls, errors.startDate && 'border-red-500')}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data de Fim {reqMark}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cn(inputCls, errors.endDate && 'border-red-500')}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Padrão de Escala {reqMark}</Label>
            <Select value={pattern} onValueChange={handlePatternChange}>
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PATTERN_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {cycleOptions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ciclo Inicial (Dia 1º) {reqMark}</Label>
              <Select value={initialCycle} onValueChange={setInitialCycle}>
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {cycleOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
