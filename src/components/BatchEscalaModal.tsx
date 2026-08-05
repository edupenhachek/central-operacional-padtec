import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers, type UserItem } from '@/services/users'
import { generateScheduleRange } from '@/services/escala-matrix'
import { getPatterns, type PadraoEscalaRecord } from '@/services/padroes-escala'
import { FALLBACK_PATTERN_OPTION, getDynamicCycleOptions } from '@/lib/escala-utils'
import { cn } from '@/lib/utils'

const TEAM_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'NOC', label: 'NOC' },
  { value: 'COPE', label: 'COPE' },
  { value: 'BKO', label: 'BKO' },
]

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
  const [teamFilter, setTeamFilter] = useState('all')
  const [users, setUsers] = useState<UserItem[]>([])
  const [patterns, setPatterns] = useState<PadraoEscalaRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (open) {
      getUsers()
        .then((u) => setUsers(u.filter((x) => x.participa_escala !== false)))
        .catch(() => {})
      getPatterns()
        .then(setPatterns)
        .catch(() => {})
      setSelectedUserIds([])
      setStartDate(defaultStartDate)
      setEndDate(defaultEndDate)
      setPattern('fixo-5x2')
      setInitialCycle('')
      setTeamFilter('all')
      setErrors({})
      setSearchQuery('')
    }
  }, [open, defaultStartDate, defaultEndDate])

  const filteredUsers = useMemo(() => {
    if (teamFilter === 'all') return users
    return users.filter((u) => (u.projeto || []).includes(teamFilter))
  }, [users, teamFilter])

  const userOptions = useMemo(
    () => filteredUsers.map((u) => ({ value: u.id, label: u.name || u.email })),
    [filteredUsers],
  )

  const searchedOptions = useMemo(() => {
    if (!searchQuery.trim()) return userOptions
    const q = searchQuery.toLowerCase()
    return userOptions.filter((u) => (u.label || '').toLowerCase().includes(q))
  }, [userOptions, searchQuery])

  const patternOptions = useMemo(
    () => [FALLBACK_PATTERN_OPTION, ...patterns.map((p) => ({ value: p.id, label: p.nome }))],
    [patterns],
  )

  const selectedPattern = useMemo(
    () => patterns.find((p) => p.id === pattern) || null,
    [patterns, pattern],
  )

  const cycleOptions = useMemo(() => {
    if (pattern === 'fixo-5x2' || !selectedPattern) return []
    return getDynamicCycleOptions(selectedPattern.qtd_semanas)
  }, [pattern, selectedPattern])

  const handlePatternChange = (value: string) => {
    setPattern(value)
    if (value === 'fixo-5x2') {
      setInitialCycle('')
    } else {
      setInitialCycle('Semana 1')
    }
  }

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    )
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

    const validUsers = selectedUsers.filter((u) => u.horario && u.projeto)
    const invalidCount = selectedUsers.length - validUsers.length
    if (validUsers.length === 0) {
      toast.error('Nenhum colaborador possui horário e projeto definidos.')
      return
    }
    if (invalidCount > 0)
      toast.warning(`${invalidCount} colaborador(es) sem horário/projeto serão ignorados.`)

    setLoading(true)
    try {
      const result = await generateScheduleRange(
        validUsers,
        startDate,
        endDate,
        pattern,
        initialCycle,
        selectedPattern?.configuracao || null,
      )
      if (result.failed > 0)
        toast.warning(`${result.succeeded} plantões criados, ${result.failed} falharam.`)
      else toast.success(`${result.succeeded} plantões gerados com sucesso!`)
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
            <Label className="text-xs font-semibold">Equipe</Label>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Colaboradores {reqMark}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar colaborador..."
                className="pl-8 h-9 text-sm bg-background dark:bg-slate-900/80 border-input"
              />
            </div>
            <div
              className={cn(
                'max-h-[300px] overflow-y-auto smooth-scroll rounded-md border border-input p-1',
                errors.users && 'border-red-500',
              )}
              style={{ scrollBehavior: 'smooth' }}
            >
              {searchedOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhum colaborador encontrado.
                </p>
              ) : (
                searchedOptions.map((u) => (
                  <label
                    key={u.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedUserIds.includes(u.value)}
                      onCheckedChange={() => toggleUser(u.value)}
                    />
                    <span>{u.label}</span>
                  </label>
                ))
              )}
            </div>
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
                {patternOptions.map((p) => (
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
