import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { upsertEscala, TURNO_OPTIONS } from '@/services/escalas'
import { SHIFT_SHORT_LABELS } from '@/lib/escala-utils'

interface CellEditContentProps {
  userId: string
  userProjeto: string
  userHorario: string
  dateStr: string
  currentTurno: string
  onSaved: () => void
  onClose: () => void
}

export function CellEditContent({
  userId,
  userProjeto,
  userHorario,
  dateStr,
  currentTurno,
  onSaved,
  onClose,
}: CellEditContentProps) {
  const [mode, setMode] = useState<'profile' | 'specific' | 'folga'>(
    currentTurno === 'FOLGA' ? 'folga' : currentTurno ? 'specific' : 'profile',
  )
  const [selectedTurno, setSelectedTurno] = useState(
    currentTurno || userHorario || TURNO_OPTIONS[0],
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      let turno = ''
      if (mode === 'profile') turno = userHorario
      else if (mode === 'folga') turno = 'FOLGA'
      else turno = selectedTurno
      if (!turno) {
        toast.error('Selecione um turno.')
        return
      }
      await upsertEscala({
        Data: dateStr,
        Usuario_ID: userId,
        Projeto: userProjeto,
        Turno: turno,
        Status: 'Previsto',
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
      <RadioGroup
        value={mode}
        onValueChange={(v) => setMode(v as 'profile' | 'specific' | 'folga')}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="profile" id="r-profile" />
          <Label htmlFor="r-profile" className="text-xs cursor-pointer">
            Horário do Perfil
          </Label>
          {userHorario && (
            <span className="text-[10px] text-muted-foreground">
              ({SHIFT_SHORT_LABELS[userHorario] || userHorario})
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="specific" id="r-specific" />
            <Label htmlFor="r-specific" className="text-xs cursor-pointer">
              Turno Específico
            </Label>
          </div>
          {mode === 'specific' && (
            <Select value={selectedTurno} onValueChange={setSelectedTurno}>
              <SelectTrigger className="h-8 text-xs">
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
          )}
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="folga" id="r-folga" />
          <Label htmlFor="r-folga" className="text-xs cursor-pointer">
            FOLGA
          </Label>
        </div>
      </RadioGroup>
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
