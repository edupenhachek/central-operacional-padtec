import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { BULK_STATUS_OPTIONS } from '@/lib/escala-utils'

interface BulkEditDialogProps {
  open: boolean
  onClose: () => void
  selectedCount: number
  onApply: (change: { status: string; observacao: string }) => void
}

export function BulkEditDialog({ open, onClose, selectedCount, onApply }: BulkEditDialogProps) {
  const [status, setStatus] = useState('F')
  const [observacao, setObservacao] = useState('')

  const handleApply = () => {
    onApply({ status, observacao: observacao.trim() })
    setObservacao('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="font-bold">Editar {selectedCount} dia(s)</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-sm">
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
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Observação</Label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value.slice(0, 500))}
              placeholder="Adicione uma observação..."
              className="text-xs min-h-[50px] resize-none"
            />
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
      </DialogContent>
    </Dialog>
  )
}
