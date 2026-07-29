import { useState, useEffect } from 'react'
import { KeyRound, Mail } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSelect } from '@/components/MultiSelect'
import type { UserRole } from '@/services/users'
import type { FieldErrors } from '@/lib/pocketbase/errors'
import { formatPhone, isValidPadtecEmail } from '@/lib/formatters'
import {
  PROJETO_OPTIONS,
  getHorarioGroupsForProjetos,
  getRoleOptionsForUser,
} from '@/lib/user-constants'

interface UserFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  user?: {
    id?: string
    name?: string
    email?: string
    role?: UserRole
    phone?: string
    projeto?: string[]
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
    projeto?: string[]
    horario_trabalho?: string
    cargo?: string
  }) => void
  onResetPassword?: (email: string) => void
  onChangeEmail?: (userId: string, newEmail: string) => Promise<void>
  currentUserRole?: UserRole
  isSelf?: boolean
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
  onChangeEmail,
  currentUserRole,
  isSelf = false,
}: UserFormDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('USUARIO')
  const [phone, setPhone] = useState('')
  const [projeto, setProjeto] = useState<string[]>([])
  const [horarioTrabalho, setHorarioTrabalho] = useState('')
  const [cargo, setCargo] = useState('')
  const [emailError, setEmailError] = useState('')

  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false)
  const [oldEmailInput, setOldEmailInput] = useState('')
  const [newEmailInput, setNewEmailInput] = useState('')
  const [emailChangeError, setEmailChangeError] = useState('')
  const [emailChangeLoading, setEmailChangeLoading] = useState(false)

  const canEditAll = currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN'
  const isRestrictedRoleEdit = !canEditAll && isSelf
  const showPassword = mode === 'create' && canEditAll
  const emailDisabled = mode === 'edit' && !(isSelf && canEditAll)

  useEffect(() => {
    if (open) {
      setName(user?.name || '')
      setEmail(user?.email || '')
      setRole(user?.role || 'USUARIO')
      setPassword('')
      setPhone(user?.phone || '')
      setProjeto(user?.projeto || [])
      setHorarioTrabalho(user?.horario_trabalho || '')
      setCargo(user?.cargo || '')
      setEmailError('')
      setShowEmailChangeDialog(false)
      setOldEmailInput('')
      setNewEmailInput('')
      setEmailChangeError('')
    }
  }, [open, user])

  const handleConfirmEmailChange = async () => {
    if (!user?.id || !onChangeEmail) return
    const currentEmail = (user.email || email).trim()
    if (oldEmailInput.trim().toLowerCase() !== currentEmail.toLowerCase()) {
      setEmailChangeError('O E-mail Antigo não confere com o e-mail atual do cadastro.')
      return
    }
    const trimmedNew = newEmailInput.trim()
    if (!trimmedNew) {
      setEmailChangeError('Por favor, informe o novo e-mail.')
      return
    }
    if (currentUserRole !== 'SUPERADMIN' && !isValidPadtecEmail(trimmedNew)) {
      setEmailChangeError('Use apenas e-mail @padtec.com ou @padtec.com.br')
      return
    }

    setEmailChangeLoading(true)
    setEmailChangeError('')
    try {
      await onChangeEmail(user.id, trimmedNew)
      setEmail(trimmedNew)
      setShowEmailChangeDialog(false)
      setOldEmailInput('')
      setNewEmailInput('')
    } catch (err: any) {
      setEmailChangeError(err?.message || 'Erro ao alterar e-mail.')
    } finally {
      setEmailChangeLoading(false)
    }
  }

  const handleSubmit = () => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && currentUserRole !== 'SUPERADMIN' && !isValidPadtecEmail(trimmedEmail)) {
      setEmailError('Use apenas e-mail @padtec.com ou @padtec.com.br')
      return
    }
    setEmailError('')
    onSubmit({
      name: name.trim(),
      email: mode === 'create' ? trimmedEmail : trimmedEmail !== user?.email ? trimmedEmail : '',
      password: showPassword ? password : undefined,
      role,
      phone: phone.trim(),
      projeto,
      horario_trabalho: horarioTrabalho || undefined,
      cargo: cargo.trim() || undefined,
    })
  }

  const inputCls =
    'h-10 text-sm text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-400 bg-background dark:bg-slate-900/80 border-input'
  const horarioGroups = getHorarioGroupsForProjetos(projeto)

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
              {mode === 'edit' && emailDisabled ? 'E-mail (Apenas Leitura)' : 'E-mail'}
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
                emailDisabled
                  ? 'bg-muted/60 dark:bg-slate-800/60 text-muted-foreground dark:text-slate-400 cursor-not-allowed opacity-90'
                  : ''
              }`}
              disabled={emailDisabled}
              readOnly={emailDisabled}
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
                Projeto
              </Label>
              <MultiSelect
                options={PROJETO_OPTIONS}
                selected={projeto}
                onChange={setProjeto}
                placeholder="Selecionar"
              />
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
                  {horarioGroups.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground dark:text-slate-400 px-2 py-1.5">
                        {group.label}
                      </SelectLabel>
                      {group.options.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="dark:focus:bg-slate-800 dark:focus:text-white"
                        >
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showPassword && (
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
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
              disabled={isRestrictedRoleEdit}
            >
              <SelectTrigger className={`h-10 text-sm ${inputCls}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 border-border">
                {getRoleOptionsForUser(currentUserRole).map((r) => (
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

          {mode === 'edit' && (
            <div className="pt-2 border-t border-border space-y-2">
              {onResetPassword && (canEditAll || isSelf) && (
                <div className="flex items-center justify-between">
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

              {canEditAll && onChangeEmail && user?.id && (
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-xs text-muted-foreground dark:text-slate-400">
                    Alteração de e-mail
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOldEmailInput('')
                      setNewEmailInput('')
                      setEmailChangeError('')
                      setShowEmailChangeDialog(true)
                    }}
                    className="text-xs gap-1.5 h-8 text-blue-600 border-blue-500/30 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-400/30 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Alterar E-mail
                  </Button>
                </div>
              )}
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

      <Dialog
        open={showEmailChangeDialog}
        onOpenChange={(v) => !v && setShowEmailChangeDialog(false)}
      >
        <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-slate-100 font-bold text-base">
              Alterar E-mail do Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground dark:text-slate-300">
              Confirme o e-mail antigo do usuário antes de atribuir o novo e-mail corporativo.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                E-mail Antigo
              </Label>
              <Input
                type="email"
                value={oldEmailInput}
                onChange={(e) => {
                  setOldEmailInput(e.target.value)
                  setEmailChangeError('')
                }}
                placeholder="Digite o e-mail atual do cadastro"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground dark:text-slate-200">
                E-mail Novo
              </Label>
              <Input
                type="email"
                value={newEmailInput}
                onChange={(e) => {
                  setNewEmailInput(e.target.value)
                  setEmailChangeError('')
                }}
                placeholder="novo.email@padtec.com.br"
                className={inputCls}
              />
            </div>

            {emailChangeError && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                {emailChangeError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailChangeDialog(false)}
                disabled={emailChangeLoading}
                className="text-xs dark:border-slate-700 dark:text-slate-200"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmEmailChange}
                disabled={emailChangeLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
              >
                {emailChangeLoading ? 'Alterando...' : 'Confirmar Alteração'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
