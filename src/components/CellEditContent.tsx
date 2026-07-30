import { useState } from 'react'
import { toast } from 'sonner'
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
import { upsertEscala } from '@/services/escalas'
import { ESCALA_STATUS_OPTIONS, SHIFT_SHORT_LABELS } from '@/lib/escala-utils'

interface CellEditContentProps {
  userId: string
  userProjeto: string
  userHorario: string
  dateStr: string
  currentTurno: string
  currentStatus: string
  currentObservacao: string
  onSaved: () => void
  onClose: () => void
}

export function CellEditContent({
  userId,
  userProjeto,
  userHorario,
  dateStr,
  currentTurno,
  currentStatus,
  currentObservacao,
  onSaved,
  onClose,
}: CellEditContentProps) {
  const getInitialStatus = () => {
    if (
      currentStatus &&
      currentStatus !== 'Previsto' &&
      currentStatus !== 'Confirmado' &&
      currentStatus !== 'Falta' &&
      currentStatus !== 'FOLGA'
    ) {
      return currentStatus
    }
    if (currentTurno === 'FOLGA') return 'FOLGA'
    return 'Horário Normal do Perfil'
  }

  const [status, setStatus] = useState(getInitialStatus())
  const [observacao, setObservacao] = useState(currentObservacao || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      let turno = ''
      let escalaStatus = 'Previsto'

      if (status === 'Horário Normal do Perfil') {
        turno = userHorario
        escalaStatus = 'Previsto'
      } else if (status === 'FOLGA') {
        turno = 'FOLGA'
        escalaStatus = 'FOLGA'
      } else {
        turno = currentTurno || userHorario || ''
        escalaStatus = status
      }

      await upsertEscala({
        Data: dateStr,
        Usuario_ID: userId,
        Projeto: userProjeto,
        Turno: turno,
        Status: escalaStatus,
        observacao: observacao.trim(),
      })
      toast.success('Plantão atualizado!')
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao atualizar plantão.')
    } finally {
      setSaving(false)
    }
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
            {ESCALA_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {status === 'Horário Normal do Perfil' && userHorario && (
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
          onClick={handleSave}
          disabled={saving}
          className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
