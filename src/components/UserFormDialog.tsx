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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nome Completo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              className="h-10 text-sm"
            />
            {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@padtec.com.br"
              className="h-10 text-sm"
            />
            {(fieldErrors.email || fieldErrors.emailConfirm) && (
              <p className="text-xs text-red-500">
                {fieldErrors.email || fieldErrors.emailConfirm}
              </p>
            )}
          </div>
          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Perfil</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.role && <p className="text-xs text-red-500">{fieldErrors.role}</p>}
          </div>

          {mode === 'edit' && onResetPassword && (
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Redefinição de acesso</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onResetPassword(email)}
                className="text-xs gap-1.5 h-8 text-amber-600 border-amber-500/30 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Resetar Senha
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
