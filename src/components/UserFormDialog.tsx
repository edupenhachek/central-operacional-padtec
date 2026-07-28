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
import { formatPhone, isValidPadtecEmail } from '@/lib/formatters'

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'USUARIO', 'FOCAL BKO', 'FOCAL NOC', 'FOCAL COPE']
const EQUIPE_OPTIONS = ['NOC', 'BKO', 'COPE', 'OHR', 'Radisys']
const HORARIO_OPTIONS = [
  '07:00 às 16:00',
  '08:00 às 17:00',
  '09:00 às 18:00',
  '13:00 às 22:00',
  '22:00 às 07:00',
  'Escala 12x36',
]

interface UserFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  user?: {
    id?: string
    name?: string
    email?: string
    role?: UserRole
    phone?: string
    equipe?: string
    horario_trabalho?: string
    cargo?: string
  } | null
  fieldErrors?: FieldErrors
  loading?: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    email: string
    password?: string
    role: UserRole
    phone?: string
    equipe?: string
    horario_trabalho?: string
    cargo?: string
  }) => void
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
  const [phone, setPhone] = useState('')
  const [equipe, setEquipe] = useState('')
  const [horarioTrabalho, setHorarioTrabalho] = useState('')
  const [cargo, setCargo] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (open) {
      setName(user?.name || '')
      setEmail(user?.email || '')
      setRole(user?.role || 'USUARIO')
      setPassword('')
      setPhone(user?.phone || '')
      setEquipe(user?.equipe || '')
      setHorarioTrabalho(user?.horario_trabalho || '')
      setCargo(user?.cargo || '')
      setEmailError('')
    }
  }, [open, user])

  const handleSubmit = () => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && !isValidPadtecEmail(trimmedEmail)) {
      setEmailError('Use apenas e-mail @padtec.com ou @padtec.com.br')
      return
    }
    setEmailError('')
    onSubmit({
      name: name.trim(),
      email: trimmedEmail,
      password: mode === 'create' ? password : undefined,
      role,
      phone: phone.trim(),
      equipe: equipe || undefined,
      horario_trabalho: horarioTrabalho || undefined,
      cargo: cargo.trim() || undefined,
    })
  }

  const inputCls =
    'h-10 text-sm text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 bg-background dark:bg-slate-900/80 border-input'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-slate-100 font-bold">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
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
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError('')
              }}
              placeholder="usuario@padtec.com.br"
              className={`${inputCls} ${
                mode === 'edit'
                  ? 'bg-muted/60 dark:bg-slate-800/60 text-muted-foreground dark:text-slate-400 cursor-not-allowed opacity-90'
                  : ''
              }`}
              disabled={mode === 'edit'}
              readOnly={mode === 'edit'}
            />
            {(emailError ||
              (mode === 'create' && (fieldErrors.email || fieldErrors.emailConfirm))) && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {emailError || fieldErrors.email || fieldErrors.emailConfirm}
              </p>
            )}
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
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Analista N1"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Equipe
              </Label>
              <Select value={equipe} onValueChange={setEquipe}>
                <SelectTrigger className={`h-10 text-sm ${inputCls}`}>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent className="bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 border-border">
                  {EQUIPE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt}
                      value={opt}
                      className="dark:focus:bg-slate-800 dark:focus:text-white"
                    >
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                Horário de Trabalho
              </Label>
              <Select value={horarioTrabalho} onValueChange={setHorarioTrabalho}>
                <SelectTrigger className={`h-10 text-sm ${inputCls}`}>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent className="bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 border-border">
                  {HORARIO_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt}
                      value={opt}
                      className="dark:focus:bg-slate-800 dark:focus:text-white"
                    >
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                className={inputCls}
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
              <SelectTrigger className={`h-10 text-sm ${inputCls}`}>
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
            <div className="pt-2 border-t border-border flex items-center justify-between">
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
