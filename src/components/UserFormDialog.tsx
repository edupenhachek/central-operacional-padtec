import { useState, useEffect } from 'react'
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
  user?: { name?: string; email?: string; role?: UserRole } | null
  fieldErrors?: FieldErrors
  loading?: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; password?: string; role: UserRole }) => void
}

export function UserFormDialog({
  open,
  mode,
  user,
  fieldErrors = {},
  loading = false,
  onClose,
  onSubmit,
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
            {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
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
            <Label className="text-xs font-semibold">Perfil / Role</Label>
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
