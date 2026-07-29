import { useState, useEffect } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { updateUser, requestPasswordReset } from '@/services/users'
import { formatPhone } from '@/lib/formatters'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (open && user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [open, user])

  if (!user) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUser(user.id, {
        name: name.trim(),
        phone: phone.trim(),
      })
      try {
        await pb.collection('users').authRefresh()
      } catch {
        /* intentionally ignored */
      }
      toast.success('Perfil atualizado com sucesso')
      onClose()
    } catch (err) {
      toast.error('Erro ao atualizar perfil', { description: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user.email) return
    setResetting(true)
    try {
      await requestPasswordReset(user.email)
      toast.success(`E-mail de redefinição enviado para ${user.email}`)
    } catch (err) {
      toast.error('Erro ao solicitar redefinição', { description: getErrorMessage(err) })
    } finally {
      setResetting(false)
    }
  }

  const inputCls =
    'h-10 text-sm text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 bg-background dark:bg-slate-900/80 border-input'
  const disabledCls =
    'bg-muted/60 dark:bg-slate-800/60 text-muted-foreground dark:text-slate-400 cursor-not-allowed opacity-90'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-slate-100 font-bold">
            Meu Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              Nome Completo
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              E-mail (Apenas Leitura)
            </Label>
            <Input
              type="email"
              value={user.email || ''}
              className={`${inputCls} ${disabledCls}`}
              disabled
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Telefone
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Cargo / Função
              </Label>
              <Input
                value={user.cargo || '—'}
                className={`${inputCls} ${disabledCls}`}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Projeto
              </Label>
              <Input
                value={(user.projeto || []).join(', ') || '—'}
                className={`${inputCls} ${disabledCls}`}
                disabled
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Horário de Trabalho
              </Label>
              <Input
                value={user.horario_trabalho || '—'}
                className={`${inputCls} ${disabledCls}`}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              Perfil
            </Label>
            <Input
              value={user.role || 'USUARIO'}
              className={`${inputCls} ${disabledCls}`}
              disabled
              readOnly
            />
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground dark:text-slate-400">
              Redefinição de acesso
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              disabled={resetting}
              className="text-xs gap-1.5 h-8 text-amber-600 border-amber-500/30 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:border-amber-400/30 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
            >
              {resetting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <KeyRound className="w-3.5 h-3.5" />
              )}
              Redefinir Senha
            </Button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-sm dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
