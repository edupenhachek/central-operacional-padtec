import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { CloudUpload } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CellEditContent } from '@/components/CellEditContent'
import { CollaboratorCell } from '@/components/CollaboratorCell'
import { BulkEditDialog } from '@/components/BulkEditDialog'
import { cn } from '@/lib/utils'
import {
  getDayHeader,
  isWeekend,
  formatDateStr,
  WEEKEND_HEADER_CLS,
  sortUsersBySchedule,
  getCellDisplayValue,
  getCellBgByValue,
  getCellColorByValue,
  type PendingChange,
} from '@/lib/escala-utils'
import { batchUpsertEscalas } from '@/services/escala-matrix'
import type { EscalaRecord } from '@/services/escalas'
import type { UserItem } from '@/services/users'

interface MatrixGridProps {
  users: UserItem[]
  escalas: EscalaRecord[]
  days: Date[]
  canEdit: boolean
  onCellSaved: () => void
  showFooter?: boolean
}

export function MatrixGrid({ users, escalas, days, canEdit, onCellSaved }: MatrixGridProps) {
  const [editKey, setEditKey] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map())
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  const mouseDownCellRef = useRef<{ userId: string; dateStr: string } | null>(null)
  const isDraggingRef = useRef(false)
  const wasDraggingRef = useRef(false)
  const shiftClickedRef = useRef(false)
  const lastSelectedCellRef = useRef<{ userId: string; dateStr: string } | null>(null)
  const selectedCellsRef = useRef<Set<string>>(new Set())

  const sortedUsers = useMemo(() => sortUsersBySchedule(users), [users])

  const escalaMap = useMemo(() => {
    const map = new Map<string, EscalaRecord>()
    for (const e of escalas) {
      const dateKey = e.Data?.split(' ')[0]
      const userId = e.expand?.Usuario_ID?.id
      if (dateKey && userId) map.set(`${userId}_${dateKey}`, e)
    }
    return map
  }, [escalas])

  const dateStrToIndex = useMemo(() => {
    const map = new Map<string, number>()
    days.forEach((d, i) => map.set(formatDateStr(d), i))
    return map
  }, [days])

  useEffect(() => {
    const handler = () => {
      if (mouseDownCellRef.current) {
        if (isDraggingRef.current && selectedCellsRef.current.size > 0) {
          setShowBulkEdit(true)
        }
        lastSelectedCellRef.current = mouseDownCellRef.current
        mouseDownCellRef.current = null
        isDraggingRef.current = false
      }
    }
    window.addEventListener('mouseup', handler)
    return () => window.removeEventListener('mouseup', handler)
  }, [])

  const selectRange = useCallback(
    (userId: string, dateStr1: string, dateStr2: string) => {
      const idx1 = dateStrToIndex.get(dateStr1)
      const idx2 = dateStrToIndex.get(dateStr2)
      if (idx1 === undefined || idx2 === undefined) return
      const [start, end] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1]
      for (let i = start; i <= end; i++) {
        selectedCellsRef.current.add(`${userId}_${formatDateStr(days[i])}`)
      }
      setSelectedCells(new Set(selectedCellsRef.current))
    },
    [dateStrToIndex, days],
  )

  const handleCellMouseDown = useCallback(
    (userId: string, dateStr: string, e: React.MouseEvent) => {
      if (!canEdit) return
      wasDraggingRef.current = false
      shiftClickedRef.current = false
      if (
        e.shiftKey &&
        lastSelectedCellRef.current &&
        lastSelectedCellRef.current.userId === userId
      ) {
        e.preventDefault()
        shiftClickedRef.current = true
        selectRange(userId, lastSelectedCellRef.current.dateStr, dateStr)
        return
      }
      selectedCellsRef.current = new Set()
      setSelectedCells(new Set())
      mouseDownCellRef.current = { userId, dateStr }
      isDraggingRef.current = false
    },
    [canEdit, selectRange],
  )

  const handleCellMouseEnter = useCallback(
    (userId: string, dateStr: string) => {
      if (!mouseDownCellRef.current || mouseDownCellRef.current.userId !== userId) return
      if (!isDraggingRef.current) {
        isDraggingRef.current = true
        wasDraggingRef.current = true
      }
      selectedCellsRef.current = new Set()
      selectRange(userId, mouseDownCellRef.current.dateStr, dateStr)
    },
    [selectRange],
  )

  const handleCellPendingChange = useCallback(
    (userId: string, dateStr: string, userProjeto: string) =>
      (change: { turno: string; status: string; observacao: string }) => {
        const cellKey = `${userId}_${dateStr}`
        setPendingChanges((prev) => {
          const newMap = new Map(prev)
          newMap.set(cellKey, { userId, dateStr, ...change, projeto: userProjeto })
          return newMap
        })
        setEditKey(null)
      },
    [],
  )

  const handleBulkApply = useCallback(
    ({ status, observacao }: { status: string; observacao: string }) => {
      setPendingChanges((prev) => {
        const newMap = new Map(prev)
        for (const cellKey of selectedCellsRef.current) {
          const sepIdx = cellKey.indexOf('_')
          const userId = cellKey.substring(0, sepIdx)
          const dateStr = cellKey.substring(sepIdx + 1)
          const user = users.find((u) => u.id === userId)
          if (!user) continue
          const turno = status === 'T' ? user.horario_trabalho || '' : ''
          const projeto = (user.projeto || [])[0] || ''
          newMap.set(cellKey, { userId, dateStr, turno, status, observacao, projeto })
        }
        return newMap
      })
      selectedCellsRef.current = new Set()
      setSelectedCells(new Set())
    },
    [users],
  )

  const handleSave = async () => {
    if (pendingChanges.size === 0) return
    setSaving(true)
    try {
      const changes = Array.from(pendingChanges.values())
      const result = await batchUpsertEscalas(changes)
      if (result.failed > 0) {
        toast.warning(`${result.succeeded} alterações salvas, ${result.failed} falharam.`)
      } else {
        toast.success('Alterações salvas com sucesso!')
      }
      setPendingChanges(new Map())
      onCellSaved()
    } catch {
      toast.error('Erro ao salvar alterações.')
    } finally {
      setSaving(false)
    }
  }

  if (sortedUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum colaborador encontrado.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {pendingChanges.size > 0
              ? `${pendingChanges.size} alteração(ões) pendente(s)`
              : 'Nenhuma alteração pendente'}
          </span>
          <Button
            onClick={handleSave}
            disabled={pendingChanges.size === 0 || saving}
            size="sm"
            className="gap-2"
          >
            <CloudUpload className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="border-collapse w-full select-none">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 w-[260px] min-w-[260px] bg-card px-3 py-1.5 text-left text-xs font-semibold border-r border-border">
                Colaborador
              </th>
              <th className="sticky left-[260px] top-0 z-20 w-[140px] min-w-[140px] bg-card px-2 py-1.5 text-center text-[10px] font-semibold border-r-2 border-slate-300 dark:border-slate-700">
                Horário
              </th>
              {days.map((day) => {
                const { day: d, weekday } = getDayHeader(day)
                const we = isWeekend(day)
                return (
                  <th
                    key={d}
                    className={cn(
                      'sticky top-0 z-20 bg-muted dark:bg-slate-800 px-1 py-1.5 text-center text-[10px] font-semibold border-r border-border/50 min-w-[42px]',
                      we && WEEKEND_HEADER_CLS,
                    )}
                  >
                    <div>{d}</div>
                    <div className="text-muted-foreground font-normal capitalize">{weekday}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => {
              const userProjeto = (user.projeto || [])[0] || ''
              const userHorario = user.horario_trabalho || ''
              return (
                <tr
                  key={user.id}
                  className="even:bg-slate-50 dark:even:bg-slate-800/50 hover:bg-muted/20 dark:hover:bg-slate-800/20"
                >
                  <td className="sticky left-0 z-20 w-[260px] min-w-[260px] bg-inherit px-2 py-1 border-r border-border">
                    <CollaboratorCell user={user} />
                  </td>
                  <td className="sticky left-[260px] z-20 w-[140px] min-w-[140px] bg-inherit px-2 py-1 text-center text-[10px] text-muted-foreground border-r-2 border-slate-300 dark:border-slate-700 align-middle">
                    {userHorario || '—'}
                  </td>
                  {days.map((day) => {
                    const dateStr = formatDateStr(day)
                    const cellKey = `${user.id}_${dateStr}`
                    const escala = escalaMap.get(cellKey)
                    const pending = pendingChanges.get(cellKey)
                    const turno = pending?.turno ?? escala?.Turno ?? ''
                    const status = pending?.status ?? escala?.Status ?? ''
                    const observacao = pending?.observacao ?? escala?.observacao ?? ''
                    const isPending = !!pending
                    const isSelected = selectedCells.has(cellKey)
                    const we = isWeekend(day)
                    const displayValue = getCellDisplayValue(status, turno, userHorario)
                    const bg = getCellBgByValue(displayValue, we)
                    const color = getCellColorByValue(displayValue)
                    const titleParts: string[] = []
                    if (userHorario) titleParts.push(userHorario)
                    if (observacao) titleParts.push(observacao)
                    const cellTitle = titleParts.length > 0 ? titleParts.join(' — ') : undefined
                    const renderContent = () => {
                      if (!displayValue) return <span className="text-muted-foreground/40">—</span>
                      return <span className={cn('text-[10px]', color)}>{displayValue}</span>
                    }
                    const renderObs = () =>
                      observacao ? (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      ) : null
                    if (canEdit) {
                      return (
                        <td
                          key={dateStr}
                          className={cn('p-0 text-center border-r border-border/50', bg)}
                        >
                          <Popover
                            open={editKey === cellKey}
                            onOpenChange={(open) => {
                              if (open && (wasDraggingRef.current || shiftClickedRef.current)) {
                                wasDraggingRef.current = false
                                shiftClickedRef.current = false
                                return
                              }
                              setEditKey(open ? cellKey : null)
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                onMouseDown={(e) => handleCellMouseDown(user.id, dateStr, e)}
                                onMouseEnter={() => handleCellMouseEnter(user.id, dateStr)}
                                className={cn(
                                  'w-full h-9 flex items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors relative',
                                  isPending && !isSelected && 'ring-2 ring-inset ring-amber-400',
                                  isSelected && 'ring-2 ring-inset ring-blue-500',
                                )}
                                title={cellTitle}
                              >
                                {renderContent()}
                                {renderObs()}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" side="bottom" align="center">
                              <CellEditContent
                                userId={user.id}
                                userProjeto={userProjeto}
                                userHorario={userHorario}
                                dateStr={dateStr}
                                currentTurno={turno}
                                currentStatus={status}
                                currentObservacao={observacao}
                                onPendingChange={handleCellPendingChange(
                                  user.id,
                                  dateStr,
                                  userProjeto,
                                )}
                                onClose={() => setEditKey(null)}
                              />
                            </PopoverContent>
                          </Popover>
                        </td>
                      )
                    }
                    return (
                      <td
                        key={dateStr}
                        className={cn(
                          'h-9 px-1 text-center align-middle border-r border-border/50',
                          bg,
                          isPending && 'ring-2 ring-inset ring-amber-400',
                        )}
                        title={cellTitle}
                      >
                        <div className="flex items-center justify-center h-full relative">
                          {renderContent()}
                          {renderObs()}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <BulkEditDialog
        open={showBulkEdit}
        onClose={() => {
          setShowBulkEdit(false)
          selectedCellsRef.current = new Set()
          setSelectedCells(new Set())
        }}
        selectedCount={selectedCells.size}
        onApply={handleBulkApply}
      />
    </div>
  )
}
