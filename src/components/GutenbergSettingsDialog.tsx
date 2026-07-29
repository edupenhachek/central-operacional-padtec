import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getGutenbergSettings, updateGutenbergSettings } from '@/services/gutenberg-settings'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

interface GutenbergSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function GutenbergSettingsDialog({ open, onClose }: GutenbergSettingsDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [settingsId, setSettingsId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getGutenbergSettings()
      .then((s) => {
        setPrompt(s.system_prompt)
        setSettingsId(s.id)
      })
      .catch(() => toast.error('Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateGutenbergSettings(settingsId, prompt)
      toast.success('Instruções de contexto atualizadas')
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar', { description: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-slate-100 font-bold">
            Instruções de Contexto (Prompt do Sistema)
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              Estas instruções são prependedas a cada mensagem enviada ao Gutenberg AI. As
              alterações entram em vigor imediatamente para novas mensagens.
            </p>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={12}
              className="text-sm bg-background dark:bg-slate-900/80 border-input"
              placeholder="Digite as instruções de contexto do sistema..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} className="text-sm">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
