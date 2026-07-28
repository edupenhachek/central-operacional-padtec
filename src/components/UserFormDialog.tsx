import { useState, useEffect } from 'react'
import { KeyRound } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/services/users'
import type { FieldErrors } from '@/lib/pocketbase/errors'

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE']

interface UserFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  user?: { id?: string; name?: string; email?: string; role?: UserRole } | null
  fieldErrors?: FieldErrors
  loading?: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; password?: string; role: UserRole }) => void
  onResetPassword?: (email: string) => void
}

export function UserFormDialog({
  open,
  mode,
  user,
  fieldErrors = {},
  loading = false,
  onClose,
  onSubmit,
  onResetPassword,
}: UserFormDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('USUARIO')

  useEffect(() => {
    if (open) {
      setName(user?.name || '')
      setEmail(user?.email || '')
      setRole(user?.role || 'USUARIO')
      setPassword('')
    }
  }, [open, user])

  const handleSubmit = () => {
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      password: mode === 'create' ? password : undefined,
      role,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-slate-100 font-bold">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              Nome Completo
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              className="h-10 text-sm text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 bg-background dark:bg-slate-900/80 border-input"
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              {mode === 'edit' ? 'E-mail (Apenas Leitura)' : 'E-mail'}
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@padtec.com.br"
              className={`h-10 text-sm text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 bg-background dark:bg-slate-900/80 border-input ${
                mode === 'edit'
                  ? 'bg-muted/60 dark:bg-slate-800/60 text-muted-foreground dark:text-slate-400 cursor-not-allowed opacity-90'
                  : ''
              }`}
              disabled={mode === 'edit'}
              readOnly={mode === 'edit'}
            />
            {mode === 'create' && (fieldErrors.email || fieldErrors.emailConfirm) && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {fieldErrors.email || fieldErrors.emailConfirm}
              </p>
            )}
          </div>
          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Senha
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 bg-background dark:bg-slate-900/80 border-input"
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
              Perfil
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="h-10 text-sm text-foreground dark:text-slate-100 bg-background dark:bg-slate-900/80 border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 border-border">
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem
                    key={r}
                    value={r}
                    className="dark:focus:bg-slate-800 dark:focus:text-white"
                  >
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.role && (
              <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.role}</p>
            )}
          </div>

          {mode === 'edit' && onResetPassword && (
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground dark:text-slate-400">
                Redefinição de acesso
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onResetPassword(email)}
                className="text-xs gap-1.5 h-8 text-amber-600 border-amber-500/30 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:border-amber-400/30 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Resetar Senha
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-sm dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
