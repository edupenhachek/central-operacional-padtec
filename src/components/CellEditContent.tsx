import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BULK_STATUS_OPTIONS, SHIFT_SHORT_LABELS } from '@/lib/escala-utils'

interface CellEditContentProps {
  userId: string
  userProjeto: string
  userHorario: string
  dateStr: string
  currentTurno: string
  currentStatus: string
  currentObservacao: string
  onPendingChange: (change: { turno: string; status: string; observacao: string }) => void
  onClose: () => void
}

export function CellEditContent({
  userHorario,
  currentTurno,
  currentStatus,
  currentObservacao,
  onPendingChange,
  onClose,
}: CellEditContentProps) {
  const getInitialStatus = () => {
    const s = currentStatus
    if (s === 'T' || s === 'Previsto' || s === 'Confirmado') return 'T'
    if (s === 'F' || s === 'FOLGA') return 'F'
    if (s === 'FÉRIAS' || s === 'Férias') return 'Férias'
    if (s === 'B' || s === 'BANCO DE HORAS') return 'B'
    if (s === 'ATESTADO' || s === 'Atestado') return 'Atestado'
    if (s === 'TREINAMENTO' || s === 'Treinamento') return 'Treinamento'
    if (s === 'FOLGA COMPENSATÓRIA' || s === 'FC') return 'FC'
    if (currentTurno === 'FOLGA') return 'F'
    return 'T'
  }

  const [status, setStatus] = useState(getInitialStatus())
  const [observacao, setObservacao] = useState(currentObservacao || '')

  const handleApply = () => {
    const turno = status === 'T' ? userHorario || currentTurno : ''
    onPendingChange({ turno, status, observacao: observacao.trim() })
    onClose()
  }

  return (
    <div className="space-y-3 p-1 w-64">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BULK_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {status === 'T' && userHorario && (
          <p className="text-[10px] text-muted-foreground">
            ({SHIFT_SHORT_LABELS[userHorario] || userHorario})
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Observação do Dia</Label>
        <Textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value.slice(0, 500))}
          placeholder="Adicione uma observação..."
          className="text-xs min-h-[60px] resize-none"
          maxLength={500}
        />
        <p className="text-[10px] text-muted-foreground text-right">{observacao.length}/500</p>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Aplicar
        </Button>
      </div>
    </div>
  )
}
